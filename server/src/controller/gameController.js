import Game from '../model/chessModel.js';
import { v4 as  uuidv4 } from 'uuid';
import { rooms, getOrCreateRoom } from '../model/roomStore.js';

// ─── POST /api/rooms ──────────────────────────────────────────────
/**
 * Create a new game room.
 * Persists to MongoDB (best-effort) and initialises the in-memory state.
 */
const createRoom = async (req, res) => {
  const roomId = uuidv4().slice(0, 8).toUpperCase();
 
  // Persist to DB (non-blocking; failures are acceptable)
  try {
    await Game.create({ roomId });
  } catch (err){
    // DB might be unavailable – continue in-memory only
    console.error('❌ DB error:', err.message); // add this
  }
 
  getOrCreateRoom(roomId);
  res.status(201).json({ roomId });
};

// ─── GET /api/rooms/:roomId ───────────────────────────────────────
/**
 * Return the current state of a single room (from in-memory store).
 */
const getRoom = (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
 
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }
 
  res.json({
    roomId:  room.roomId,
    fen:     room.chess.fen(),
    pgn:     room.chess.pgn(),
    players: room.players,
    status:  room.status,
    moves:   room.moves,
    turn:    room.chess.turn(),
  });
};
 

// ─── GET /api/games ───────────────────────────────────────────────
/**
 * List active / waiting games.
 * Falls back to in-memory rooms when the DB is unavailable.
 */
const listGames = async (req, res) => {
  try {
    const games = await Game
      .find({ status: { $in: ['active', 'waiting'] } })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
 
    return res.json(games);
  } catch {
    // DB unavailable – return in-memory snapshot
    const activeRooms = [...rooms.values()].map((r) => ({
      roomId:  r.roomId,
      status:  r.status,
      players: r.players,
    }));
    return res.json(activeRooms);
  }
};


// ─── GET /api/health ──────────────────────────────────────────────
const healthCheck = (_req, res) => res.json({ status: 'ok' });

export {
    createRoom, 
    getRoom, 
    listGames,
    healthCheck
}