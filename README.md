# Profolio Backend

This is the backend API for **Profolio** — built with **Express.js**, **TypeScript**, and **pnpm** — designed to work with both **MongoDB** and **PostgreSQL**. It features a clean, modular structure with Zod validation, JWT authentication, file uploads via Cloudinary, and production-ready tooling.

---

## Tech Stack

- Node.js + TypeScript
- Express.js
- pnpm
- MongoDB (Mongoose)
- PostgreSQL (pg)
- Zod (Schema Validation)
- JWT (Access & Refresh Tokens)
- Cloudinary (File Uploads)
- CORS + Rate Limiting
- ESLint + Prettier
- Deployed on Railway

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Abdulhamidsa/cre8ify-backend-develop.git
cd cre8ify-backend-develop
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

> Note: Some features (like Cloudinary uploads and OpenAI/Gemini integrations) require external services. The app will still run without them, but those features will be disabled unless configured.

---

## Scripts

```json
"scripts": {
  "clean": "rimraf dist",
  "build": "tsc && node add-js-extensions.js",
  "start": "pnpm run build && node dist/index.js",
  "dev": "tsx watch --clear-screen=false src/index.ts"
}
```

- `pnpm dev` – Start in development mode
- `pnpm build` – Compile TypeScript
- `pnpm start` – Run production build

---

## Features

- Authentication (Signup, Login, JWT with HTTP-only cookies)
- Modular route/controller/service structure
- Zod validation
- Cloudinary file uploads
- CORS & rate limiting
- Centralized logging + error handling
- Type-safe config
- Dual DB support: MongoDB + PostgreSQL

---

## Code Quality

```bash
pnpm eslint .
pnpm prettier --write .
```

---

## License

MIT © Abdulhamid Alsaati
