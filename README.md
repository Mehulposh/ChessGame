# ♚ Grand Chess — Multiplayer Chess App

A real-time multiplayer chess application built with the **MERN stack** (MongoDB, Express, React, Node.js) and **Socket.IO**. Two players can create or join a room and play a full game of chess with live move synchronization, in-game chat, and game history persistence.

---

## 📸 Features

- ♟ **Real-time multiplayer** — moves sync instantly between both players via WebSockets
- 🏠 **Room-based matchmaking** — create a room and share the 8-character code with your opponent
- 💾 **MongoDB persistence** — games, moves, and PGN saved to the database
- 💬 **In-game chat** — real-time messaging between players
- 🔄 **Move history** — full PGN-style move list in the sidebar
- ✅ **Legal move enforcement** — powered by chess.js on both client and server
- 🏁 **Game end detection** — checkmate, stalemate, draw, resignation, draw offers
- 👁 **Spectator support** — third+ players join as spectators
- 📱 **Responsive** — works on desktop and mobile

---

## 🛠 Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Express.js | REST API server |
| Socket.IO | Real-time WebSocket communication |
| Mongoose | MongoDB ODM |
| chess.js | Server-side move validation |
| uuid | Room ID generation |
| dotenv | Environment variable management |
| nodemon | Development auto-restart |

### Frontend
| Package | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| socket.io-client | WebSocket client |
| react-chessboard | Interactive chess board UI |
| chess.js | Client-side board state |
| Tailwind CSS | Utility-first styling |
| Vite | Frontend build tool & dev server |

---

## 📁 Project Structure

```
ChessGame/
├── server/                         # Express + Socket.IO backend
│   ├── index.js                    # App entry point
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── Game.js                 # Mongoose game schema
│   │   └── roomStore.js            # In-memory room state (Map)
│   ├── controllers/
│   │   └── roomController.js       # REST handler functions
│   ├── routes/
│   │   └── roomRoutes.js           # API route definitions
│   ├── middleware/
│   │   ├── asyncHandler.js         # Async error wrapper
│   │   ├── requestLogger.js        # HTTP request logger
│   │   └── errorHandler.js         # Global error handler
│   └── sockets/
│       ├── index.js                # Socket.IO server init
│       └── socketHandlers.js       # All socket event handlers
│
└── client/                         # React + Tailwind frontend
    ├── vite.config.js              # Vite config with API proxy
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                 # Router setup
        ├── index.js                # Entry point
        ├── index.css               # Tailwind directives + fonts
        ├── context/
        │   ├── socketInstance.js   # createContext()
        │   └── SocketContext.jsx   # SocketProvider component
        ├── hooks/
        │   ├── useSocket.js        # useSocket() hook
        │   └── useChessGame.js     # All game state logic
        └── pages/ & components/
            ├── Home.jsx            # Create / Join room page
            ├── Game.jsx            # Main game layout
            ├── GameStatus.jsx      # Status, resign, draw controls
            ├── PlayerTag.jsx       # Player name + turn indicator
            ├── MoveHistory.jsx     # PGN move list
            ├── Chat.jsx            # Real-time chat panel
            └── GameOverOverlay.jsx # Win / loss / draw modal
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on port `27017` (or a MongoDB Atlas URI)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chess-game.git
cd chess-game
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chessapp
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

The server runs on **http://localhost:5000**

### 3. Setup the Client

```bash
cd client
npm install
npm run dev
```

The frontend runs on **http://localhost:5173**

> ⚠️ Make sure the server is running before starting the client.

---

## 🔌 API Reference

### REST Endpoints

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/health` | Health check | `{ status: 'ok' }` |
| `POST` | `/api/rooms` | Create a new game room | `{ roomId: 'A3F8B2C1' }` |
| `GET` | `/api/rooms/:roomId` | Get room state | Room object |
| `GET` | `/api/games` | List active games | Array of games |

**Example — Create a room:**
```bash
curl -X POST http://localhost:5000/api/rooms
# Response: { "roomId": "A3F8B2C1" }
```

### Socket.IO Events

#### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join_room` | `{ roomId, playerName }` | Join or create a room |
| `make_move` | `{ roomId, move: { from, to, promotion } }` | Make a chess move |
| `resign` | `{ roomId }` | Resign the game |
| `offer_draw` | `{ roomId }` | Offer a draw to opponent |
| `accept_draw` | `{ roomId }` | Accept opponent's draw offer |
| `send_message` | `{ roomId, message, playerName }` | Send a chat message |

#### Server → Client

| Event | Payload | Description |
|---|---|---|
| `room_joined` | `{ color, fen, players, status, moves }` | Confirmed room entry + current state |
| `room_update` | `{ players, status, fen }` | Room state changed |
| `game_start` | `{ players }` | Both players connected, game begins |
| `move_made` | `{ move, fen, pgn, inCheck, gameOver }` | A move was played |
| `game_over` | `{ winner, reason }` | Game ended |
| `draw_offered` | `{ from }` | Opponent offered a draw |
| `new_message` | `{ playerName, message, timestamp }` | New chat message |
| `player_disconnected` | `{ color }` | A player left |

---

## 🎮 How to Play

1. Open **http://localhost:5173** in your browser
2. Enter your name and click **Create New Game**
3. Copy the **Room Code** shown in the sidebar
4. Share the code with your opponent — they enter it on the home page and click **Join Game**
5. White moves first — drag and drop pieces to make moves
6. Use the sidebar buttons to **Offer Draw** or **Resign**

---

## 🗄 Database Schema

```js
Game {
  roomId:   String,    // 8-char unique room code (e.g. "A3F8B2C1")
  fen:      String,    // Current board position (FEN notation)
  pgn:      String,    // Full game in PGN notation
  moves:    [{ from, to, san, timestamp }],
  players: {
    white:  { socketId, name },
    black:  { socketId, name },
  },
  status:   'waiting' | 'active' | 'finished',
  result:   String,    // e.g. "checkmate", "resignation"
  createdAt: Date,
  updatedAt: Date,
}
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/chessapp` | MongoDB connection string |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

---

## 🧩 Architecture Notes

- **In-memory + DB dual storage** — game state lives in a `Map` for low-latency access during play; moves and final state are persisted to MongoDB asynchronously (best-effort)
- **Socket.IO polling transport** — used instead of WebSocket to avoid conflicts with Vite's HMR WebSocket server in development
- **Module-level socket singleton** — the Socket.IO client is created once at module load, surviving React StrictMode's double-invoke of effects
- **Ref-based callbacks** — `makeMove` reads game state from refs rather than closed-over state values to avoid stale closure bugs

---

## 📄 License

MIT
