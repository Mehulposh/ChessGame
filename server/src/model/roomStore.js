import { Chess } from 'chess.js';

/**
 * Global in-memory store for active game rooms.
 * Each entry holds the live Chess instance and room metadata.
 *
 * Shape:
 * {
 *   roomId:    string,
 *   chess:     Chess,           // chess.js instance
 *   players:   { white: { socketId, name } | null, black: … | null },
 *   spectators: string[],       // socket IDs
 *   status:    'waiting' | 'active' | 'finished',
 *   moves:     { from, to, san, timestamp }[],
 * }
 */
const rooms = new Map();

/**
 * Returns an existing room or creates a fresh one.
 * @param {string} roomId
 */
const getOrCreateRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      chess:      new Chess(),
      players:    { white: null, black: null },
      spectators: [],
      status:     'waiting',
      moves:      [],
    });
  }
  return rooms.get(roomId);
};

export { rooms, getOrCreateRoom };