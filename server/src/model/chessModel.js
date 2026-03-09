import  mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  fen: { type: String, default: 'start' },
  pgn: { type: String, default: '' },
  moves: [{ from: String, to: String, promotion: String, san: String, timestamp: Date }],
  players: {
    white: { type: String, default: null },
    black: { type: String, default: null }
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'checkmate', 'draw', 'resigned'],
    default: 'waiting'
  },
  winner: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Game', GameSchema);