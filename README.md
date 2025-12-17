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
git clone https://github.com/MichaelSuarezR/B-Food.git
cd B-Food

# Backend deps
cd backend
npm install

# Mobile deps
cd ../frontend/mobile
npm install

#Start Expo and clear the Metro cache:
cd ../frontend/mobile
npx expo start -c
```
Then:
- Install Expo Go on your phone
- Scan the QR code shown in the terminal from the camera, and open it in Expo
- The app should open and load the dev build
