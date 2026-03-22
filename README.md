# 🛍️ Wardrobe X — AI Fashion Try-On Store

A full-stack luxury fashion store with AI-powered virtual try-on using **Gemini AI** by Google.

---

## 📁 Project Structure

```
wardrobe-x/
├── backend/        # Node.js + Express API
└── frontend/       # Next.js 14 App Router
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and fill in your environment variables
cp .env.example .env
# Required: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY

npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Copy and fill in your environment variables
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev
# Runs on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `CLIENT_URL` | Frontend URL (e.g. `http://localhost:3000`) |
| `PORT` | Server port (default: 5000) |

### Frontend `.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

---

## ✨ Features

### Customer Features
- 🔐 Authentication (Register / Login / Profile)
- 🛍️ Product browsing with filters (category, price, size, search)
- ❤️ Wishlist management
- 🛒 Shopping cart with checkout (COD)
- 📦 Order tracking
- 🤖 **AI Virtual Try-On** — Upload photo + select outfit = magic
- 📥 Download try-on results
- 🌙 Dark/Light mode toggle

### Admin Features
- 📊 Dashboard with stats (users, orders, revenue, try-ons)
- 📦 Product CRUD (create with images, edit, soft-delete)
- 👥 User management (view, activate/ban)
- 🧾 Order management (view, update status)

### Technical Features
- Images stored in **MongoDB GridFS**
- **Gemini 2.0 Flash** for photorealistic try-on generation
- Fully responsive (mobile, tablet, desktop)
- Luxury dark-gold UI with animations (Framer Motion)
- Custom fonts: Cormorant Garamond + Outfit + Space Mono

---

## 🤖 AI Try-On Setup

The AI try-on uses **Gemini 2.0 Flash Experimental** with multimodal image generation.

1. Get your Gemini API key at https://aistudio.google.com/
2. Set `GEMINI_API_KEY` in the backend `.env`
3. Make sure your Gemini API key has access to `gemini-2.0-flash-exp` with image generation

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Font | Cormorant Garamond (serif display) |
| Body Font | Outfit (sans-serif) |
| Mono Font | Space Mono |
| Gold | `#d4af37` |
| Dark BG | `#0e0e12` |
| Theme | Dark-first, Light available |

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)
- `PUT /api/auth/profile` (protected)

### Products
- `GET /api/products` — with filters
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/products/:id/reviews` (protected)

### Try-On
- `POST /api/tryon` — perform AI try-on (protected)
- `GET /api/tryon/history` (protected)
- `POST /api/tryon/video` — generate video (protected)

### Wishlist
- `GET /api/wishlist` (protected)
- `POST /api/wishlist/toggle` (protected)
- `DELETE /api/wishlist/clear` (protected)

### Orders
- `POST /api/orders` (protected)
- `GET /api/orders/my` (protected)

### Admin (admin only)
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/toggle`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/:id/status`

### Images
- `GET /api/images/:gridId` — stream image from GridFS

---

## 📱 Pages

| Route | Page |
|---|---|
| `/` | Landing page with hero, how-it-works, featured |
| `/shop` | Product listing with filters |
| `/shop/:id` | Product detail with try-on |
| `/tryon` | AI Try-On Studio |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/profile` | User profile |
| `/wishlist` | Wishlist |
| `/cart` | Cart + checkout |
| `/orders` | Order history |
| `/admin` | Admin dashboard |
| `/admin/products` | Admin product management |
| `/admin/users` | Admin user management |
| `/admin/orders` | Admin order management |

---

## 📦 Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), GridFS, JWT, Multer, Gemini AI SDK

**Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion, next-themes, react-dropzone, react-hot-toast, react-icons

---

*Built with ❤️ for FYP — Wardrobe X © 2025*
