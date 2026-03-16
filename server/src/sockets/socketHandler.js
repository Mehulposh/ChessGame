import  Game from '../model/chessModel.js';
import  { rooms, getOrCreateRoom } from '../model/roomStore.js';

/**
 * Registers all Socket.IO event handlers onto a single socket.
 * Called once per connection from the main socket initialiser.
 *
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerSocketHandlers = (socket, io) => {

  // ── join_room ───────────────────────────────────────────────────
  socket.on('join_room', ({ roomId, playerName }) => {
    const room = getOrCreateRoom(roomId);
    socket.join(roomId);

    const assignedColor = _assignColor(socket, room, playerName);

    socket.data.roomId = roomId;
    socket.data.color  = assignedColor;

    // Tell the joining socket about the current room state
    socket.emit('room_joined', {
      color:   assignedColor,
      fen:     room.chess.fen(),
      players: room.players,
      status:  room.status,
      moves:   room.moves,
    });

    // Broadcast updated room state to everyone
    io.to(roomId).emit('room_update', {
      players: room.players,
      status:  room.status,
      fen:     room.chess.fen(),
    });

    if (room.status === 'active') {
      io.to(roomId).emit('game_start', { players: room.players });
    }

    // Persist player assignment (best-effort)
    if (assignedColor !== 'spectator') {
      Game.findOneAndUpdate(
        { roomId },
        {
          [`players.${assignedColor}`]: { socketId: socket.id, name: playerName },
          status: room.status,
        }
      ).catch(() => {});
    }
  });

  // ── make_move ───────────────────────────────────────────────────
  socket.on('make_move', ({ roomId, move }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'active') return;

    const playerColor = socket.data.color;
    const currentTurn = room.chess.turn() === 'w' ? 'white' : 'black';

    if (playerColor !== currentTurn) {
      return socket.emit('move_error', { message: "It's not your turn" });
    }

    try {
      const result = room.chess.move(move);
      if (!result) {
        return socket.emit('move_error', { message: 'Invalid move' });
      }

      const moveRecord = {
        from:      result.from,
        to:        result.to,
        san:       result.san,
        timestamp: new Date(),
      };
      room.moves.push(moveRecord);

      const gameOver = _checkGameOver(room, currentTurn);

      io.to(roomId).emit('move_made', {
        move:    moveRecord,
        fen:     room.chess.fen(),
        pgn:     room.chess.pgn(),
        inCheck: room.chess.inCheck(),
        gameOver,
      });

      if (gameOver) {
        io.to(roomId).emit('game_over', gameOver);
      }

      // Persist move (best-effort)
      Game.findOneAndUpdate(
        { roomId },
        {
          fen:        room.chess.fen(),
          pgn:        room.chess.pgn(),
          $push:      { moves: moveRecord },
          status:     room.status,
          updatedAt:  new Date(),
        }
      ).catch(() => {});

    } catch {
      socket.emit('move_error', { message: 'Invalid move' });
    }
  });

  // ── resign ──────────────────────────────────────────────────────
  socket.on('resign', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const winner = socket.data.color === 'white' ? 'black' : 'white';
    room.status  = 'finished';
    io.to(roomId).emit('game_over', { winner, reason: 'resignation' });
  });

  // ── offer_draw ──────────────────────────────────────────────────
  socket.on('offer_draw', ({ roomId }) => {
    socket.to(roomId).emit('draw_offered', { from: socket.data.color });
  });

  // ── accept_draw ─────────────────────────────────────────────────
  socket.on('accept_draw', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.status = 'finished';
    io.to(roomId).emit('game_over', { winner: null, reason: 'draw agreement' });
  });

  // ── send_message ────────────────────────────────────────────────
  socket.on('send_message', ({ roomId, message, playerName }) => {
    io.to(roomId).emit('new_message', {
      playerName,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // ── disconnect ──────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const { roomId, color } = socket.data;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    if (color === 'white' || color === 'black') {
      io.to(roomId).emit('player_disconnected', { color });

      if (room.status === 'active') {
        room.status = 'waiting';
        io.to(roomId).emit('room_update', { players: room.players, status: room.status });
      }
    }

    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
};

// ─── Private helpers ─────────────────────────────────────────────

/**
 * Assigns white / black / spectator to the connecting socket
 * and mutates the room accordingly.
 */
function _assignColor(socket, room, playerName) {
  if (!room.players.white) {
    room.players.white = { socketId: socket.id, name: playerName || 'Player 1' };
    room.status        = 'waiting';
    return 'white';
  }

  if (!room.players.black && room.players.white.socketId !== socket.id) {
    room.players.black = { socketId: socket.id, name: playerName || 'Player 2' };
    room.status        = 'active';
    return 'black';
  }

  if (room.players.white?.socketId === socket.id) return 'white';
  if (room.players.black?.socketId === socket.id) return 'black';

  room.spectators.push(socket.id);
  return 'spectator';
}

/**
 * Detects end-of-game conditions and updates room.status.
 * Returns a gameOver object or null.
 */
function _checkGameOver(room, currentTurn) {
  const { chess } = room;

  if (chess.isCheckmate()) {
    room.status = 'finished';
    return { winner: currentTurn, reason: 'checkmate' };
  }
  if (chess.isDraw()) {
    room.status = 'finished';
    return { winner: null, reason: 'draw' };
  }
  if (chess.isStalemate()) {
    room.status = 'finished';
    return { winner: null, reason: 'stalemate' };
  }

  return null;
}

export default registerSocketHandlers;