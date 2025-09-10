# Echo Room

A real-time chat application built with **React, Vite, TailwindCSS, Express and WebSockets**.  
Users can create or join rooms, chat instantly, see participants, track typing indicators, and toggle themes — all in real time.

---

## Features
- Real-time messaging using **WebSockets**
- Join/leave room presence detection
- Participant list with online/offline status
- Typing indicators
- Notifications for joins/leaves & status change
- Light/Dark theme toggle
- Auto-scrolling chat window
- Clipboard support for sharing room IDs

---

## Tech Stack
### Frontend (client)
- **React + Vite** (fast build tool & hot reload)
- **TailwindCSS** (styling)
- **React Router** (navigation)
- **Custom Hooks** (WebSocket state management)

### Backend (server)
- **Node.js + WebSocket (ws)** for real-time communication
- **JWT** for user identification
- Simple in-memory room management

---

## Setup & Run Locally
1. Clone the repository.
2. Create `.env` files in server and client directories.
    1. Server `.env` example:
    ```bash
    JWT_SECRET_KEY=your_jwt_secret
    CORS_ORIGIN=http://localhost:5173
    PORT=3000
    ```
    2. Client `.env` example:
    ```bash
    VITE_API_URL=http://localhost:3000
    VITE_WS_URL=ws://localhost:3000
    ```
    3. Install dependencies & Run locally:
    ```bash
    npm install
    cd server && npm install
    cd ..
    cd client && npm install
    cd ..
    npm run start
    ```
---

## Deployment
- **Frontend:** Vercel (for instant CDN delivery)
- **Backend:** Render *Note: first-time requests may take a few seconds due to cold starts.*

---

## License
MIT License