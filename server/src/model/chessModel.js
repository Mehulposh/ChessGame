import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema(
  {
    from:      { type: String, required: true },
    to:        { type: String, required: true },
    san:       { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema(
  {
    socketId: { type: String },
    name:     { type: String },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    roomId: {
      type:     String,
      unique:   true,
      required: true,
      index:    true,
    },
    fen: {
      type:    String,
      default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    },
    pgn:    { type: String, default: '' },
    moves:  { type: [moveSchema], default: [] },
    players: {
      white: { type: playerSchema, default: null },
      black: { type: playerSchema, default: null },
    },
    status: {
      type:    String,
      enum:    ['waiting', 'active', 'finished'],
      default: 'waiting',
    },
    result: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Game', gameSchema);