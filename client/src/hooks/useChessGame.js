import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';

export const useChessGame = (socket, roomId) => {
  const chessRef = useRef(null);
  if (chessRef.current === null) chessRef.current = new Chess();

  const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const [fen,         setFen]         = useState(INITIAL_FEN);
  const [myColor,     setMyColor]     = useState(null);
  const [players,     setPlayers]     = useState({ white: null, black: null });
  const [gameStatus,  setGameStatus]  = useState('waiting');
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove,    setLastMove]    = useState(null);
  const [inCheck,     setInCheck]     = useState(false);
  const [gameOver,    setGameOver]    = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [drawOffered, setDrawOffered] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('w');

  // Refs for values needed inside callbacks without causing stale closures
  const myColorRef    = useRef(null);
  const gameStatusRef = useRef('waiting');
  const currentTurnRef = useRef('w');

  // Keep refs in sync with state
  const updateGameStatus = (s) => { gameStatusRef.current = s;  setGameStatus(s); };
  const updateMyColor    = (c) => { myColorRef.current = c;     setMyColor(c); };
  const updateTurn       = (t) => { currentTurnRef.current = t; setCurrentTurn(t); };

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.off('room_joined');
    socket.off('room_update');
    socket.off('game_start');
    socket.off('move_made');
    socket.off('game_over');
    socket.off('draw_offered');
    socket.off('new_message');
    socket.off('player_disconnected');

    socket.on('room_joined', ({ color, fen, players, status, moves }) => {
      console.log('🎯 room_joined:', { color, status });
      updateMyColor(color);
      chessRef.current.load(fen);
      setFen(fen);
      updateTurn(chessRef.current.turn());
      setPlayers(players);
      updateGameStatus(status);
      setMoveHistory(moves || []);
    });

    socket.on('room_update', ({ players, status, fen }) => {
      console.log('🔄 room_update:', { status });
      setPlayers(players);
      updateGameStatus(status);
      if (fen) {
        chessRef.current.load(fen);
        setFen(fen);
        updateTurn(chessRef.current.turn());
      }
    });

    socket.on('game_start', ({ players }) => {
      console.log('🎮 game_start received');
      setPlayers(players);
      updateGameStatus('active');
    });

    socket.on('move_made', ({ move, fen, inCheck, gameOver }) => {
      chessRef.current.load(fen);
      setFen(fen);
      updateTurn(chessRef.current.turn());
      setLastMove({ from: move.from, to: move.to });
      setMoveHistory(prev => [...prev, move]);
      setInCheck(inCheck);
      if (gameOver) setGameOver(gameOver);
    });

    socket.on('game_over', (result) => {
      setGameOver(result);
      updateGameStatus('finished');
    });

    socket.on('draw_offered', ({ from }) => {
      if (from !== myColorRef.current) setDrawOffered(true);
    });

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('player_disconnected', ({ color }) => {
      setPlayers(prev => ({ ...prev, [color]: null }));
      updateGameStatus('waiting');
    });

    return () => {
      socket.off('room_joined');
      socket.off('room_update');
      socket.off('game_start');
      socket.off('move_made');
      socket.off('game_over');
      socket.off('draw_offered');
      socket.off('new_message');
      socket.off('player_disconnected');
    };
  }, [socket, roomId]);

  // Uses refs — always reads latest values, never stale
  const makeMove = useCallback((move) => {
    const status = gameStatusRef.current;
    const color  = myColorRef.current;
    const turn   = currentTurnRef.current;

    console.log('♟ makeMove called:', { status, color, turn });

    if (!socket)              { console.warn('no socket'); return false; }
    if (status !== 'active')  { console.warn('game not active:', status); return false; }
    if (color !== (turn === 'w' ? 'white' : 'black')) {
      console.warn('not your turn:', { color, turn });
      return false;
    }

    socket.emit('make_move', { roomId, move });
    return true;
  }, [socket, roomId]);

  const resign      = useCallback(() => socket?.emit('resign',       { roomId }), [socket, roomId]);
  const offerDraw   = useCallback(() => socket?.emit('offer_draw',   { roomId }), [socket, roomId]);
  const acceptDraw  = useCallback(() => {
    socket?.emit('accept_draw', { roomId });
    setDrawOffered(false);
  }, [socket, roomId]);
  const sendMessage = useCallback((message, playerName) => {
    socket?.emit('send_message', { roomId, message, playerName });
  }, [socket, roomId]);

  // Safe to read state here since this is called during render
  const isMyTurn = () => {
    if (!myColor || gameStatus !== 'active') return false;
    return currentTurn === (myColor === 'white' ? 'w' : 'b');
  };

  return {
    fen, myColor, players, gameStatus, moveHistory, lastMove,
    inCheck, gameOver, messages, drawOffered, currentTurn,
    makeMove, resign, offerDraw, acceptDraw, sendMessage, isMyTurn,
  };
};