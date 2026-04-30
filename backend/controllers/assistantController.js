const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');

/**
 * @desc   Chat with AI Fashion Assistant
 * @route  POST /api/assistant/chat
 * @access Public/Private
 */
const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Load store products for context
    const products = await Product.find({ status: { $ne: 'inactive' } })
      .select('name category price images description')
      .limit(50)
      .lean();

    const productList = products
      .map(p => `ID: ${p._id} | Name: ${p.name} | Category: ${p.category} | Price: PKR ${p.price?.toLocaleString()}${p.description ? ' | Desc: ' + p.description.slice(0, 100) : ''}`)
      .join('\n');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = 
      `You are "Wardrobe X AI Assistant", a high-end luxury fashion stylist. Your goal is to help users find the perfect outfit from our store.\n\n` +
      `STORE CATALOGUE:\n${productList || 'No products available.'}\n\n` +
      `GUIDELINES:\n` +
      `1. Be professional, elegant, and helpful. Use a sophisticated tone.\n` +
      `2. When a user asks for recommendations (e.g., "what to wear for a wedding"), suggest 2-3 specific products from the catalogue above.\n` +
      `3. Always provide the product name and why it's a good choice.\n` +
      `4. IMPORTANT: You MUST return your response in a structured JSON format so the UI can render it nicely.\n` +
      `5. If the user is just chatting, still use the JSON format with an empty suggestions array.\n\n` +
      `RESPONSE FORMAT (JSON ONLY):\n` +
      `{\n` +
      `  "text": "Your helpful stylist response here...",\n` +
      `  "suggestions": [\n` +
      `    { "productId": "id_from_catalogue", "reason": "short explanation why" }\n` +
      `  ]\n` +
      `}`;

    const callAssistant = async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: {
          role: 'user',
          parts: [
            { text: systemPrompt },
            ...history.map(msg => ({
              text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
            })),
            { text: `Current Message: ${message}` }
          ]
        },
        config: {
          responseMimeType: "application/json",
        }
      });
    };

    let response;
    try {
      console.log('  Assistant: Trying gemini-2.5-flash...');
      response = await callAssistant('gemini-2.5-flash');
    } catch (err) {
      console.warn(`  Assistant: gemini-2.5-flash failed (${err.message}). Trying fallback gemini-2.0-flash...`);
      try {
        // Use 2.0-flash as the primary fallback in 2026
        response = await callAssistant('gemini-2.0-flash');
      } catch (err2) {
        console.warn(`  Assistant: gemini-2.0-flash failed (${err2.message}). Trying fallback gemini-1.5-flash-8b...`);
        try {
          // Try the smaller 8b model which usually has higher availability
          response = await callAssistant('gemini-1.5-flash-8b');
        } catch (err3) {
          console.error('  Assistant: All fallbacks failed.');
          throw err3;
        }
      }
    }

    const responseText = response.candidates?.[0]?.content?.parts
      ?.filter(p => p.text).map(p => p.text).join('') || '{}';

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      // Fallback if JSON parsing fails
      analysis = { text: responseText, suggestions: [] };
    }

    // Enrich suggestions with full product details
    if (analysis.suggestions?.length) {
      analysis.suggestions = analysis.suggestions.map(s => {
        const product = products.find(p => p._id.toString() === s.productId);
        if (!product) return null;
        return {
          ...s,
          product: {
            _id: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.images?.[0]?.gridId || null
          }
        };
      }).filter(Boolean);
    }

    return res.json({ success: true, ...analysis });

  } catch (error) {
    console.error('Assistant Error:', error.message);
    return res.status(500).json({ error: 'Failed to get response from AI assistant' });
  }
};

module.exports = { chatWithAssistant };
