const { GoogleGenAI } = require('@google/genai');
const TryOn = require('../models/TryOn');
const Product = require('../models/Product');
const User = require('../models/User');
const { getGridFSBucket } = require('../config/db');
const sharp = require('sharp');

// ── Model strategy ────────────────────────────────────────────────────────────
// Try-on:  3.1 primary (preserves outfit faithfully) → 2.5 fallback
// Frames:  2.5 only (fast, 3 parallel calls, minor quality tradeoff is fine)
const TRYON_MODEL_PRIMARY = 'gemini-3.1-flash-image-preview';
const TRYON_MODEL_FALLBACK = 'gemini-2.5-flash-image';
const FRAME_MODEL = 'gemini-2.5-flash-image';

// ─── Save base64 to GridFS ────────────────────────────────────────────────────
const saveToGridFS = (base64Data, filename, mimeType) => new Promise((resolve, reject) => {
  const up = getGridFSBucket().openUploadStream(filename, { contentType: mimeType });
  up.end(Buffer.from(base64Data, 'base64'));
  up.on('finish', () => resolve(up.id));
  up.on('error', reject);
});

// ─── Call one Gemini model with timeout ──────────────────────────────────────
const callGemini = (ai, model, parts, timeoutMs) => {
  const req = ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: '3:4',
        // imageSize '1K' is required for 3.1 — without it the model generates
        // a huge image and crashes. 2.5 does not support this param.
        ...(model.includes('3.1') ? { imageSize: '1K' } : {}),
      },
    },
  });
  const timer = new Promise((_, rej) =>
    setTimeout(() => rej(new Error(`${model} timed out after ${timeoutMs / 1000}s`)), timeoutMs)
  );
  return Promise.race([req, timer]);
};

// ─── Extract image from Gemini response ──────────────────────────────────────
const extractImage = (response) => {
  const candidates = response.candidates || [];
  if (!candidates.length) throw new Error('No candidates returned.');
  for (const part of candidates[0].content.parts) {
    if (part.inlineData) {
      return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
    }
  }
  const txt = candidates[0].content.parts.filter(p => p.text).map(p => p.text).join('');
  throw new Error('No image returned: ' + txt.slice(0, 100));
};

// ─── Try-on: 3.1 primary (90s) → 2.5 fallback (60s) ─────────────────────────
const tryOnWithFallback = async (ai, parts) => {
  // Try 3.1 first — best quality, keeps outfit faithful
  try {
    console.log(`  Trying ${TRYON_MODEL_PRIMARY}...`);
    const response = await callGemini(ai, TRYON_MODEL_PRIMARY, parts, 90000);
    const image = extractImage(response);
    console.log(`  ✅ ${TRYON_MODEL_PRIMARY} succeeded`);
    return image;
  } catch (err) {
    console.warn(`  ❌ ${TRYON_MODEL_PRIMARY} failed: ${err.message}`);
  }
  // Fallback to 2.5
  try {
    console.log(`  Trying ${TRYON_MODEL_FALLBACK}...`);
    const response = await callGemini(ai, TRYON_MODEL_FALLBACK, parts, 60000);
    const image = extractImage(response);
    console.log(`  ✅ ${TRYON_MODEL_FALLBACK} succeeded`);
    return image;
  } catch (err) {
    console.warn(`  ❌ ${TRYON_MODEL_FALLBACK} failed: ${err.message}`);
  }
  return null;
};

// ─── Angle frame: 2.5 only (fast, 60s timeout) ───────────────────────────────
const generateFrame = async (ai, parts, label) => {
  try {
    console.log(`  [${label}] Calling ${FRAME_MODEL}...`);
    const response = await callGemini(ai, FRAME_MODEL, parts, 60000);
    const image = extractImage(response);
    console.log(`  [${label}] ✅ Done`);
    return image;
  } catch (err) {
    console.warn(`  [${label}] ❌ Failed: ${err.message}`);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// @desc   Perform AI virtual try-on
// @route  POST /api/tryon
// @access Private
// ═══════════════════════════════════════════════════════════════════════════
const performTryOn = async (req, res) => {
  let tryOnRecord = null;
  const startTime = Date.now();

  try {
    const { productId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Please upload your photo' });
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    tryOnRecord = await TryOn.create({
      user: req.user._id, product: productId,
      status: 'processing', aiModel: TRYON_MODEL_PRIMARY,
    });

    // Load product image from GridFS
    let productBuf = null;
    if (product.images?.length) {
      const primary = product.images.find(i => i.isPrimary) || product.images[0];
      if (primary?.gridId) {
        try {
          const chunks = [];
          const stream = getGridFSBucket().openDownloadStream(primary.gridId);
          await new Promise((res2, rej) => {
            stream.on('data', c => chunks.push(c));
            stream.on('end', res2);
            stream.on('error', rej);
          });
          productBuf = Buffer.concat(chunks);
          console.log(`  Product image: ${productBuf.length} bytes`);
        } catch (e) { console.warn('  GridFS error:', e.message); }
      }
    }

    if (!productBuf) {
      return res.status(400).json({ error: 'Product has no image. Upload one first.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const resultImage = await tryOnWithFallback(ai, [
      {
        text:
          `You are a photorealistic virtual try-on AI. You will receive two images.\n` +
          `IMAGE 1: A photo of a REAL PERSON (the customer).\n` +
          `IMAGE 2: A product photo of a CLOTHING ITEM.\n\n` +
          `YOUR TASK: Generate ONE output image showing the person from IMAGE 1 wearing the exact clothing from IMAGE 2.\n\n` +
          `=== CRITICAL CLOTHING ACCURACY RULES ===\n` +
          `COLOR: Match the exact color from IMAGE 2. Do not change the shade, hue or saturation.\n\n` +
          `EMBROIDERY & SURFACE DETAIL:\n` +
          `- Reproduce embroidery at FULL density. Do NOT simplify or reduce it.\n` +
          `- Every area with embroidery in IMAGE 2 must have embroidery in the result.\n` +
          `- Border embroidery at hem must be fully preserved — same width, same density.\n` +
          `- Embroidery thread color must match IMAGE 2 exactly.\n\n` +
          `DESIGN: Neckline, sleeve length, garment length, buttons — copy exactly from IMAGE 2.\n\n` +
          `NEVER: simplify embroidery, change colors, or replace outfit with a generic garment.\n\n` +
          `=== PERSON RULES ===\n` +
          `Keep face, hair, skin tone, body shape, and pose EXACTLY as in IMAGE 1. Only change clothing.\n\n` +
          `=== OUTPUT ===\n` +
          `Photorealistic fashion photo. Natural drape and shadows. Clean background. No watermarks.\n\n` +
          `Garment: "${product.name}" | ${product.category}` +
          `${product.description ? ` | ${product.description}` : ''}`,
      },
      { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } },
      { inlineData: { data: productBuf.toString('base64'), mimeType: 'image/jpeg' } },
    ]);

    if (!resultImage) throw new Error('AI try-on failed. Please try again.');

    const [resultGridId, userImageGridId] = await Promise.all([
      saveToGridFS(resultImage.base64, `tryon_result_${tryOnRecord._id}`, resultImage.mimeType),
      saveToGridFS(req.file.buffer.toString('base64'), `tryon_user_${tryOnRecord._id}`, req.file.mimetype),
    ]);

    const processingTime = Date.now() - startTime;
    await TryOn.findByIdAndUpdate(tryOnRecord._id, {
      status: 'completed',
      resultImageGridId: resultGridId,
      resultImageBase64: `data:${resultImage.mimeType};base64,${resultImage.base64}`,
      userImageGridId,
      processingTime,
    });
    await User.findByIdAndUpdate(req.user._id, { $push: { tryonHistory: tryOnRecord._id } });

    console.log(`🎉 Try-on done in ${(processingTime / 1000).toFixed(1)}s`);
    return res.json({
      success: true,
      tryOnId: tryOnRecord._id,
      resultImage: `data:${resultImage.mimeType};base64,${resultImage.base64}`,
      processingTime,
      message: `Try-on completed in ${(processingTime / 1000).toFixed(1)}s`,
    });

  } catch (error) {
    console.error('Try-on error:', error.message);
    if (tryOnRecord) {
      await TryOn.findByIdAndUpdate(tryOnRecord._id, { status: 'failed', errorMessage: error.message });
    }
    return res.status(500).json({ error: error.message || 'Try-on failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// @desc   Generate 360° frames using gemini-2.5 (fast parallel calls)
// @route  POST /api/tryon/video
// @access Private
// ═══════════════════════════════════════════════════════════════════════════
const generateVideo = async (req, res) => {
  try {
    const { tryOnId } = req.body;

    const tryOn = await TryOn.findById(tryOnId).populate('product');
    if (!tryOn) return res.status(404).json({ error: 'Try-on not found' });
    if (tryOn.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (tryOn.status !== 'completed' || !tryOn.resultImageBase64) {
      return res.status(400).json({ error: 'Complete the try-on image first.' });
    }

    console.log(`🎬 Generating 360° frames with ${FRAME_MODEL}...`);
    const t0 = Date.now();

    const match = tryOn.resultImageBase64.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match) throw new Error('Invalid stored image format.');
    const [, frontMime, frontBase64] = match;
    const frontBuf = Buffer.from(frontBase64, 'base64');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const productName = tryOn.product?.name || 'outfit';

    // Fire all 3 angle requests in parallel using fast 2.5 model
    console.log('  Generating 3 angles in parallel...');
    const [res3Q, resSide, resBack] = await Promise.allSettled([
      generateFrame(ai, [
        { text: `IMAGE EDITING: Rotate the person in this photo 45 degrees to the right (3/4 view). Keep the EXACT same "${productName}" outfit — same colors, same pattern, same design. White studio background, full body.` },
        { inlineData: { data: frontBase64, mimeType: frontMime } },
      ], '3/4 right'),
      generateFrame(ai, [
        { text: `IMAGE EDITING: Rotate the person in this photo 90 degrees to the right (side profile). Keep the EXACT same "${productName}" outfit — same colors, same pattern, same design. White studio background, full body.` },
        { inlineData: { data: frontBase64, mimeType: frontMime } },
      ], 'side right'),
      generateFrame(ai, [
        { text: `IMAGE EDITING: Show the person in this photo from the BACK (rear view). Keep the EXACT same "${productName}" outfit. White studio background, full body rear view.` },
        { inlineData: { data: frontBase64, mimeType: frontMime } },
      ], 'back'),
    ]);

    console.log(`  Angles done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

    const W = 400;
    const frontMeta = await sharp(frontBuf).metadata();
    const H = Math.round(frontMeta.height * (W / frontMeta.width));
    const toJpeg = (buf) => sharp(buf).resize(W, H, { fit: 'fill' }).jpeg({ quality: 90 }).toBuffer();
    const frontJpeg = await toJpeg(frontBuf);

    const buf3Q = res3Q.status === 'fulfilled' && res3Q.value ? Buffer.from(res3Q.value.base64, 'base64') : null;
    const bufSide = resSide.status === 'fulfilled' && resSide.value ? Buffer.from(resSide.value.base64, 'base64') : null;
    const bufBack = resBack.status === 'fulfilled' && resBack.value ? Buffer.from(resBack.value.base64, 'base64') : null;

    const aiCount = [!!buf3Q, !!bufSide, !!bufBack].filter(Boolean).length;
    console.log(`  AI angles: 3/4=${!!buf3Q} side=${!!bufSide} back=${!!bufBack}`);

    // Fallback to flipped front if an angle failed
    const jpeg3Q = buf3Q ? await toJpeg(buf3Q) : await sharp(frontJpeg).flop().jpeg({ quality: 90 }).toBuffer();
    const jpegSide = bufSide ? await toJpeg(bufSide) : await sharp(frontJpeg).flop().jpeg({ quality: 90 }).toBuffer();
    const jpegBack = bufBack ? await toJpeg(bufBack) : await sharp(frontJpeg).flop().jpeg({ quality: 90 }).toBuffer();
    const jpegSideL = await sharp(jpegSide).flop().jpeg({ quality: 90 }).toBuffer();
    const jpeg3QL = await sharp(jpeg3Q).flop().jpeg({ quality: 90 }).toBuffer();

    const keyFrames = [frontJpeg, jpeg3Q, jpegSide, jpegBack, jpegSideL, jpeg3QL];
    const frames = keyFrames.map(buf => `data:image/jpeg;base64,${buf.toString('base64')}`);

    const totalSec = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`🎬 360° done in ${totalSec}s — ${frames.length} frames, ${aiCount} AI angles`);

    return res.json({
      success: true,
      message: `360° generated in ${totalSec}s`,
      frames,
      frameCount: frames.length,
      aiFrames: aiCount,
      delay: 500,
    });

  } catch (error) {
    console.error('Video error:', error.message);
    return res.status(500).json({ error: error.message || 'Video generation failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
const getTryOnHistory = async (req, res) => {
  try {
    const tryOns = await TryOn.find({ user: req.user._id })
      .populate('product', 'name category price images')
      .sort({ createdAt: -1 }).limit(20);
    return res.json({ success: true, tryOns });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getTryOn = async (req, res) => {
  try {
    const tryOn = await TryOn.findById(req.params.id).populate('product');
    if (!tryOn) return res.status(404).json({ error: 'Try-on not found' });
    if (tryOn.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    return res.json({ success: true, tryOn });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { performTryOn, generateVideo, getTryOnHistory, getTryOn };

// ═══════════════════════════════════════════════════════════════════════════
// @desc   AI analysis of try-on result — fabric, color, fit, suggestions
// @route  POST /api/tryon/analyse
// @access Private
// ═══════════════════════════════════════════════════════════════════════════
const analyseTryOn = async (req, res) => {
  try {
    const { tryOnId } = req.body;

    const tryOn = await TryOn.findById(tryOnId).populate('product');
    if (!tryOn) return res.status(404).json({ error: 'Try-on not found' });
    if (tryOn.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (!tryOn.resultImageBase64) {
      return res.status(400).json({ error: 'No try-on result to analyse.' });
    }

    // Load store products for suggestions
    const storeProducts = await Product.find({
      _id: { $ne: tryOn.product?._id },
      status: { $ne: 'inactive' },
    }).select('name category price images description').limit(40).lean();

    const productList = storeProducts
      .map(p => `id:${p._id} | ${p.name} | ${p.category} | PKR ${p.price?.toLocaleString()}${p.description ? ' | ' + p.description.slice(0, 80) : ''}`)
      .join('\n');

    const match = tryOn.resultImageBase64.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match) throw new Error('Invalid image format.');
    const [, mime, base64] = match;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log('🔍 Analysing try-on result...');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text:
              `You are an expert fashion stylist and colour analyst. Analyse this virtual try-on image and respond ONLY with a valid JSON object — no markdown, no code fences, no extra text.\n\n` +
              `Return this exact structure:\n` +
              `{\n` +
              `  "fabricAnalysis": {\n` +
              `    "texture": "one sentence about the fabric texture",\n` +
              `    "material": "guessed material e.g. chiffon, cotton, silk",\n` +
              `    "quality": "Premium / Mid-range / Casual"\n` +
              `  },\n` +
              `  "colourAnalysis": {\n` +
              `    "dominant": "main colour name",\n` +
              `    "palette": ["colour1", "colour2", "colour3"],\n` +
              `    "season": "Spring/Summer or Autumn/Winter",\n` +
              `    "skinToneMatch": "Excellent / Good / Fair / Poor",\n` +
              `    "skinToneReason": "one sentence why"\n` +
              `  },\n` +
              `  "fitAnalysis": {\n` +
              `    "overallFit": "Excellent / Good / Needs Adjustment",\n` +
              `    "positives": ["positive1", "positive2"],\n` +
              `    "concerns": ["concern1"] or [],\n` +
              `    "styleScore": number from 1 to 10\n` +
              `  },\n` +
              `  "overallVerdict": {\n` +
              `    "looksGood": true or false,\n` +
              `    "summary": "2-3 sentence honest stylist verdict",\n` +
              `    "occasions": ["occasion1", "occasion2", "occasion3"]\n` +
              `  },\n` +
              `  "suggestions": [\n` +
              `    { "productId": "id from list", "productName": "name", "reason": "why this suits them better" }\n` +
              `  ]\n` +
              `}\n\n` +
              `IMPORTANT: You MUST always include 2-3 suggestions from the store catalogue below, even if the current outfit looks good. ` +
              `Choose items that complement this person's style, body type, or skin tone.\n\n` +
              `STORE CATALOGUE (use the exact id values in your response):\n` +
              `${productList || 'No products available.'}\n\n` +
              `Rules for suggestions:\n` +
              `- Always pick exactly 2-3 products from the catalogue above\n` +
              `- Use the exact id value from the catalogue in the productId field\n` +
              `- Write a personalised reason why this specific person would look good in it\n` +
              `- Be honest in your overall verdict — if the outfit looks great say so, if not explain constructively.`,
          },
          { inlineData: { data: base64, mimeType: mime } },
        ],
      },
      config: { responseMimeType: 'application/json' },
    });

    const raw = response.candidates?.[0]?.content?.parts
      ?.filter(p => p.text).map(p => p.text).join('') || '{}';

    let analysis;
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      analysis = JSON.parse(clean);
    } catch {
      throw new Error('Failed to parse AI analysis response.');
    }

    // Enrich suggestions with full product data
    if (analysis.suggestions?.length) {
      analysis.suggestions = analysis.suggestions.map(s => {
        const product = storeProducts.find(p => p._id.toString() === s.productId);
        return {
          ...s,
          product: product ? {
            _id: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            gridId: product.images?.[0]?.gridId || null,
          } : null,
        };
      }).filter(s => s.product);
    }

    console.log('✅ Analysis complete');
    return res.json({ success: true, analysis });

  } catch (error) {
    console.error('Analysis error:', error.message);
    return res.status(500).json({ error: error.message || 'Analysis failed.' });
  }
};

module.exports = { performTryOn, generateVideo, getTryOnHistory, getTryOn, analyseTryOn };