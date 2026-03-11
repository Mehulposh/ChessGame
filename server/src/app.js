import  express from 'express';
import  http from 'http';
import  { Server } from 'socket.io';
import  mongoose from 'mongoose';
import  cors from 'cors';
import  { Chess } from 'chess.js';
import  { v4 as uuidv4 } from 'uuid';
import  Game from './model/chessModel.js';
import  gamesRouter from './routes/gameRoute.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use('/api/games', gamesRouter);

// In-memory chess instances
const activeGames = {};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chessdb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create a new game
  socket.on('create_game', async () => {
    const gameId = uuidv4().slice(0, 8).toUpperCase();
    const chess = new Chess();
    activeGames[gameId] = { chess, players: { white: socket.id, black: null } };

    try {
      await Game.create({ gameId, players: { white: socket.id } });
    } catch (e) { console.error(e); }

    socket.join(gameId);
    socket.emit('game_created', { gameId, color: 'white' });
    console.log(`Game ${gameId} created`);
  });

  // Join existing game
  socket.on('join_game', async ({ gameId }) => {
    const game = activeGames[gameId];
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    if (game.players.black) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }

    game.players.black = socket.id;
    socket.join(gameId);

    try {
      await Game.findOneAndUpdate({ gameId }, { 'players.black': socket.id, status: 'active' });
    } catch (e) { console.error(e); }

    socket.emit('game_joined', { gameId, color: 'black', fen: game.chess.fen() });
    io.to(gameId).emit('game_started', {
      fen: game.chess.fen(),
      players: game.players,
      turn: 'white'
    });
  });

  // Make a move
  socket.on('make_move', async ({ gameId, from, to, promotion }) => {
    const game = activeGames[gameId];
    if (!game) return;

    const { chess, players } = game;
    const currentTurn = chess.turn() === 'w' ? 'white' : 'black';
    const playerColor = players.white === socket.id ? 'white' : 'black';

    if (playerColor !== currentTurn) {
      socket.emit('error', { message: "It's not your turn" });
      return;
    }

    try {
      const move = chess.move({ from, to, promotion: promotion || 'q' });
      if (!move) {
        socket.emit('invalid_move', { from, to });
        return;
      }

      let status = 'active';
      let winner = null;

      if (chess.isCheckmate()) {
        status = 'checkmate';
        winner = playerColor;
      } else if (chess.isDraw()) {
        status = 'draw';
      }

      // Update DB
      await Game.findOneAndUpdate({ gameId }, {
        fen: chess.fen(),
        pgn: chess.pgn(),
        status,
        winner,
        updatedAt: new Date(),
        $push: { moves: { from, to, promotion, san: move.san, timestamp: new Date() } }
      });

      io.to(gameId).emit('move_made', {
        fen: chess.fen(),
        move: { from, to, san: move.san },
        turn: chess.turn() === 'w' ? 'white' : 'black',
        inCheck: chess.inCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        status,
        winner
      });
    } catch (err) {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  // Resign
  socket.on('resign', async ({ gameId }) => {
    const game = activeGames[gameId];
    if (!game) return;
    const playerColor = game.players.white === socket.id ? 'white' : 'black';
    const winner = playerColor === 'white' ? 'black' : 'white';

    await Game.findOneAndUpdate({ gameId }, { status: 'resigned', winner });
    io.to(gameId).emit('game_over', { reason: 'resignation', winner });
    delete activeGames[gameId];
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Notify opponents
    for (const [gameId, game] of Object.entries(activeGames)) {
      if (game.players.white === socket.id || game.players.black === socket.id) {
        io.to(gameId).emit('player_disconnected');
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));