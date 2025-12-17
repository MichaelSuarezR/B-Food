# B-Food

B-Food lets UCLA students either order from campus dining halls or offer deliveries for other Bruins. The mobile app (Expo/React Native) consumes an Express API backed by Supabase to display live dining status, manage chats, and handle a delivery workflow—all with full dark-mode support.

---

## Features
- **Live Dining Status** – Scrapes UCLA dining and activity feeds for Epic at Ackerman, Bruin Café, Rendezvous, and The Study at Hedrick.
- **Dark Mode Everywhere** – Home cards, safe areas, and nav adapt instantly.
- **Profile & Inbox Modals** – Access profile or chats from the home screen; keep nav focused on Order vs Deliver.
- **Deliver Tab** – Dedicated CTA + explainer for couriers, tied into the listing creation flow.
- **Supabase Auth/Data** – Shared backend for users, conversations, and scraped dining data.

---

## Tech Stack

| Layer         | Stack                                     |
| ------------- | ----------------------------------------- |
| Mobile Client | Expo / React Native / TypeScript          |
| Backend API   | Node.js / Express + Supabase (Postgres)   |
| Infra         | Render (API), Expo for dev builds         |

---

## Setup

### Requirements
- Node.js 18+
- npm (or yarn)
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (service & anon tokens)
- Render (or equivalent) for deploying the API

### Installation
```bash
git clone https://github.com/<your-username>/B-Food.git
cd B-Food
npm install

# Backend deps
cd backend && npm install

# Mobile deps
cd ../frontend/mobile && npm install

## 🛠 Environment Variables

### Frontend (`frontend/mobile/.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
EXPO_PUBLIC_API_URL=<https://your-api or http://localhost:3001>
Backend (backend/.env)Code snippetSUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
PORT=3001
🚀 Local Development1. BackendBashcd backend
npm run dev
2. Expo AppBashcd frontend/mobile
npm start --tunnel
Note: Scan the QR code in Expo Go (or press i / a for simulators). Ensure your EXPO_PUBLIC_API_URL matches your running API address.📂 Project Structurebackend/: Express API with TypeScript (src/routes, src/lib).frontend/: Mobile application folder.mobile/components: Reusable UI elements.mobile/screens: Main application views.📜 ScriptsCommandDescriptionnpm run dev (backend)Start Express API with nodemonnpm run build (backend)Compile TypeScript to express/distnpm start --tunnel (frontend)Expo dev server with tunnelnpm start (frontend)Expo dev server (LAN/local)🌐 DeploymentAPI: Deploy the backend folder (Render or similar). Run npm run build, set your SUPABASE_* environment variables, and expose the PORT.Mobile: Update .env with your production public API URL and build using Expo EAS.⚖️ License© 2025 B-Food. All rights reserved.
