# B-Food

B-Food is a UCLA-focused marketplace for ordering from on-campus dining halls or offering deliveries to other students. The project uses a React Native (Expo) mobile app, a Next.js web shell, and an Express API backed by Supabase. You can clone this repo and run the mobile client locally to see the live dining status cards and the delivery workflow.

---

## Features

- **Live Dining Status Cards** – Scrapes UCLA dining pages and activity meters to show current open/closed state, hours, and activity levels for Epic at Ackerman, Bruin Café, Rendezvous, and The Study at Hedrick.
- **Dark Mode Toggle** – Full theme support, including the safe area, bottom navigation, and in-app cards.
- **Profile & Inbox Modals** – Profile, messages, and individual chats open as full-screen modals from the home screen (avatar + chat icon) rather than cluttering the main navigation.
- **Deliver Tab** – A dedicated screen for students who want to post availability and accept delivery requests; tied into the listing creation flow.
- **Supabase Backed** – Authentication and persistent user data are managed through Supabase, including the REST API for the mobile client.

---

## Tech Stack

| Layer      | Stack                                                      |
| ---------- | ---------------------------------------------------------- |
| Mobile App | Expo / React Native, TypeScript                            |
| Backend    | Node.js / Express, Supabase (Postgres + Auth)              |
| Infrastructure | Render (Express API), Expo (development)               |

---

## Getting Started

### Requirements

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (service role + anon keys)
- Render or equivalent host for the Express API

### Setup

1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend/mobile && npm install

Environment Variables

frontend/mobile/.env

EXPO_PUBLIC_SUPABASE_URL=<your supabase url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
EXPO_PUBLIC_API_URL=<your deployed express url or http://localhost:3001>
backend/.env

SUPABASE_URL=<your supabase url>
SUPABASE_SERVICE_ROLE_KEY=<supabase service role key>
PORT=3001
Run the backend

cd backend
npm run dev
Run the Expo app

cd frontend/mobile
npm start --tunnel
Scan the QR code using Expo Go on your phone (or press i/a for simulator). Make sure EXPO_PUBLIC_API_URL matches your deployed backend or http://localhost:3001.

Project Structure
backend/
  express/
    src/
      routes/
      lib/
frontend/
  mobile/
    screens/
    components/
    lib/
Scripts
Command	Description
npm run dev (backend)	Start the Express API with nodemon
npm run build (backend)	TypeScript build
npm start --tunnel (frontend/mobile)	Expo dev server with tunnel for devices
npm start (frontend/mobile)	Expo dev server (LAN/localhost)
Deployment
API: Deploy backend/express/dist via Render. Ensure env vars are set (Supabase service role key, etc.).
Mobile: Build with Expo EAS once the backend URL is public.
Web: (If you use Next.js or need a marketing site) adjust as needed.
License
This repository is proprietary to B-Food. Redistribution without permission is prohibited.

If you have ideas or run into issues, open an issue or contact the project maintainer.


Replace the old README entirely with that markdown so the repo reflects the new B-Food scope.
