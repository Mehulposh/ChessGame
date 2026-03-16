import React, { useEffect, useState , useRef} from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import useSocket from '../context/UseSocket.js';
import { useChessGame } from '../hooks/useChessGame.js';
import MoveHistory    from '../components/MoveHistory.jsx';
import Chat           from '../components/Chat.jsx';
import GameStatus     from '../components/GameStatus.jsx';
import PlayerTag      from '../components/PlayerTag.jsx';
import GameOverOverlay from '../components/GameOverOverlay.jsx';

export default function Game() {
  const { roomId }       = useParams();
  const [searchParams]   = useSearchParams();
  const playerName       = searchParams.get('name') || 'Anonymous';
  const { socket, connected } = useSocket();
 
  const [copied, setCopied] = useState(false);
 
  const {
    fen, myColor, players, gameStatus, moveHistory, lastMove,
    inCheck, gameOver, messages, drawOffered, currentTurn,
    makeMove, resign, offerDraw, acceptDraw, sendMessage, isMyTurn,
  } = useChessGame(socket, roomId);
 
  useEffect(() => {
    if (!socket) return;
 
    let retryTimer = null;
 
    const joinRoom = () => {
      console.log(`📨 Emitting join_room | connected: ${socket.connected} | id: ${socket.id}`);
      if (!socket.connected) {
        console.warn('Socket not connected yet, will retry on connect event');
        return;
      }
      socket.emit('join_room', { roomId, playerName });
 
      // Retry after 2s if room_joined hasn't come back
      retryTimer = setTimeout(() => {
        console.warn('⚠️ No room_joined received, retrying...');
        joinRoom();
      }, 2000);
    };
 
    const onRoomJoined = () => {
      console.log('✅ room_joined received, clearing retry timer');
      clearTimeout(retryTimer);
    };
 
    socket.on('room_joined', onRoomJoined);
 
    if (socket.connected) {
      joinRoom();
    }
    socket.on('connect', joinRoom);
 
    return () => {
      clearTimeout(retryTimer);
      socket.off('connect', joinRoom);
      socket.off('room_joined', onRoomJoined);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
 
  const onDrop = (from, to) => {
    console.log('🎯 onDrop:', { from, to, gameStatus, myColor, currentTurn });
    return makeMove({ from, to, promotion: 'q' }) !== false;
  };
 
  // Compute draggable directly from state — don't rely on isMyTurn() helper
  const myTurnColor = myColor === 'white' ? 'w' : 'b';
  const draggable   = gameStatus === 'active'
    && myColor !== null
    && myColor !== 'spectator'
    && currentTurn === myTurnColor;
 
  const squareStyles = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: 'rgba(255,214,0,0.22)' };
    squareStyles[lastMove.to]   = { backgroundColor: 'rgba(255,214,0,0.32)' };
  }
 
  const boardOrientation = myColor === 'black' ? 'black' : 'white';
  const topColor         = boardOrientation === 'white' ? 'black' : 'white';
  const bottomColor      = boardOrientation;
 
  const copyRoom = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
 
  return (
    <div className="min-h-screen bg-white flex items-stretch">
 
      {/* ── Left sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col gap-5 p-5
                         border-r border-gold-400/10 bg-white/1.5">
 
        {/* Room code */}
        <div>
          <p className="font-display text-[0.6rem] tracking-[0.18em] text-gold-400/50 uppercase mb-1.5">
            Room Code
          </p>
          <button
            onClick={copyRoom}
            className="w-full flex items-center justify-between
                       bg-gold-400/6 border border-gold-400/20 rounded-lg
                       px-4 py-2.5 hover:bg-gold-400/10 transition-colors group"
          >
            <span className="font-mono text-lg tracking-[0.2em] text-gold-400">{roomId}</span>
            <span className="text-ink-500 group-hover:text-gold-400 transition-colors text-sm">
              {copied ? '✓' : '⧉'}
            </span>
          </button>
          <p className="text-[0.68rem] text-ink-600 mt-1 text-center font-body">
            Share with your opponent
          </p>
        </div>
 
        <div className="h-px bg-gold-400/8" />
 
        <GameStatus
          gameStatus={gameStatus}
          myColor={myColor}
          myTurn={draggable}
          inCheck={inCheck}
          gameOver={gameOver}
          drawOffered={drawOffered}
          onResign={resign}
          onOfferDraw={offerDraw}
          onAcceptDraw={acceptDraw}
          onDeclineDraw={() => {}}
        />
 
        <div className="h-px bg-gold-400/8" />
 
        <MoveHistory moves={moveHistory} />
      </aside>
 
      {/* ── Board center ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center gap-3 p-4 lg:p-6">
 
        {/* Mobile room code */}
        <div className="lg:hidden w-full max-w-140 flex items-center justify-between
                        bg-white/3 border border-gold-400/15 rounded-lg px-4 py-2 mb-1">
          <span className="font-display text-xs tracking-widest text-gold-400/60 uppercase">Room</span>
          <button onClick={copyRoom} className="font-mono text-gold-400 tracking-widest text-sm">
            {roomId} {copied ? '✓' : '⧉'}
          </button>
        </div>
 
        {/* Opponent tag */}
        <div className="w-full max-w-140">
          <PlayerTag
            name={players[topColor]?.name}
            color={topColor}
            isActive={gameStatus === 'active' && currentTurn === (topColor === 'white' ? 'w' : 'b')}
            isYou={myColor === topColor}
          />
        </div>
 
        {/* Board */}
        <div
          className={`rounded-sm overflow-hidden transition-shadow duration-300
            ${draggable ? 'board-active' : 'board-idle'}`}
          style={{ width: 'min(560px, calc(100vw - 2rem))' }}
        >
          <Chessboard
            id="main-board"
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={boardOrientation}
            arePiecesDraggable={draggable}
            customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
            customDarkSquareStyle={{ backgroundColor: '#b58863' }}
            customSquareStyles={squareStyles}
            customBoardStyle={{ borderRadius: '2px' }}
          />
        </div>
 
        {/* My tag */}
        <div className="w-full max-w-140">
          <PlayerTag
            name={players[bottomColor]?.name}
            color={bottomColor}
            isActive={gameStatus === 'active' && currentTurn === (bottomColor === 'white' ? 'w' : 'b')}
            isYou={myColor === bottomColor}
          />
        </div>
 
        {/* Mobile actions */}
        <div className="lg:hidden w-full max-w-140 flex gap-2 mt-1">
          {gameStatus === 'active' && myColor !== 'spectator' && (
            <>
              <button
                onClick={offerDraw}
                className="flex-1 py-2 text-xs font-display tracking-wide rounded-md
                           text-gold-400 border border-gold-400/30 hover:bg-gold-400/8"
              >
                🤝 Draw
              </button>
              <button
                onClick={() => { if (window.confirm('Resign?')) resign(); }}
                className="flex-1 py-2 text-xs font-display tracking-wide rounded-md
                           text-red-400 border border-red-500/25 hover:bg-red-500/8"
              >
                🏳 Resign
              </button>
            </>
          )}
        </div>
      </main>
 
      {/* ── Right sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col gap-5 p-5
                         border-l border-gold-400/10 bg-white/1.5">
 
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'}`} />
          <span className="font-display text-[0.6rem] tracking-wider text-ink-500 uppercase">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
 
        <div className="h-px bg-gold-400/8" />
 
        <Chat
          messages={messages}
          onSend={(msg) => sendMessage(msg, playerName)}
          playerName={playerName}
        />
      </aside>
 
      <GameOverOverlay
        gameOver={gameOver}
        myColor={myColor}
        players={players}
      />
    </div>
  );
}
 
 