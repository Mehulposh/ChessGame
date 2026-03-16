import React from 'react';

export default function GameOverOverlay({ gameOver, myColor, players }) {
  if (!gameOver) return null;

  const won  = gameOver.winner === myColor;
  const draw = gameOver.winner === null;

  const winnerName = gameOver.winner === 'white'
    ? players.white?.name
    : players.black?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12120f] border border-gold-400/25 rounded-2xl
                      px-12 py-10 text-center shadow-[0_40px_80px_rgba(0,0,0,0.8)]
                      animate-slide-up max-w-sm w-full mx-4">

        <div className="text-6xl mb-4">
          {draw ? '🤝' : won ? '🏆' : '😔'}
        </div>

        <h2 className="font-display text-2xl font-bold text-gold-300 mb-1">
          {draw
            ? 'Draw!'
            : won
            ? 'You Win!'
            : `${winnerName ?? 'Opponent'} Wins`}
        </h2>

        <p className="font-body italic text-ink-400 text-base mb-7">
          by {gameOver.reason}
        </p>

        <button
          onClick={() => window.location.href = '/'}
          className="px-8 py-2.5 rounded-lg font-display text-sm tracking-wider
                     text-gold-400 border border-gold-400/40
                     hover:bg-gold-400/10 transition-colors duration-200"
        >
          ← Back to Lobby
        </button>
      </div>
    </div>
  );
}