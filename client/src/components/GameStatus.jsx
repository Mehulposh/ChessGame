import React from 'react';

export default function GameStatus({
  gameStatus, myColor, myTurn, inCheck,
  gameOver, drawOffered,
  onResign, onOfferDraw, onAcceptDraw, onDeclineDraw,
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-[0.6rem] tracking-[0.18em] text-gold-400/50 uppercase">
        Status
      </h3>

      {/* Status badge */}
      <div className={`px-3 py-2 rounded-md text-sm font-body text-center border
        ${gameStatus === 'waiting'
          ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
          : gameStatus === 'active'
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
          : 'bg-gold-400/10 border-gold-400/25 text-gold-400'
        }`}>
        {gameStatus === 'waiting'  && '⏳ Waiting for opponent'}
        {gameStatus === 'active'   && (myTurn ? '⚔ Your Turn' : "⏱ Opponent's Turn")}
        {gameStatus === 'finished' && '🏁 Game Over'}
      </div>

      {/* CHECK alert */}
      {inCheck && gameStatus === 'active' && (
        <div className="px-3 py-2 rounded-md text-sm font-display font-bold tracking-wider
                        text-center text-red-400 bg-red-500/10 border border-red-500/30
                        animate-check-flash">
          ♟ CHECK!
        </div>
      )}

      {/* Playing as */}
      {myColor && myColor !== 'spectator' && gameStatus !== 'finished' && (
        <p className="text-center font-body text-sm text-ink-400">
          Playing as{' '}
          <span className="text-gold-300 font-semibold">
            {myColor === 'white' ? '○ White' : '● Black'}
          </span>
        </p>
      )}
      {myColor === 'spectator' && (
        <p className="text-center font-body text-sm text-ink-500 italic">Watching as spectator</p>
      )}

      {/* Draw offer */}
      {drawOffered && (
        <div className="bg-gold-400/8 border border-gold-400/20 rounded-md p-3 text-center">
          <p className="font-body text-sm text-gold-300 mb-2">Opponent offers a draw</p>
          <div className="flex gap-2">
            <button
              onClick={onAcceptDraw}
              className="flex-1 py-1.5 rounded text-xs font-display tracking-wide
                         bg-emerald-500/15 border border-emerald-500/35 text-emerald-400
                         hover:bg-emerald-500/25 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={onDeclineDraw}
              className="flex-1 py-1.5 rounded text-xs font-display tracking-wide
                         bg-red-500/10 border border-red-500/25 text-red-400
                         hover:bg-red-500/20 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {gameStatus === 'active' && !gameOver && myColor && myColor !== 'spectator' && (
        <div className="flex flex-col gap-2">
          <button
            onClick={onOfferDraw}
            className="py-2 px-3 rounded-md text-xs font-display tracking-wider
                       text-gold-400 border border-gold-400/30
                       hover:bg-gold-400/8 transition-colors duration-150"
          >
            🤝 Offer Draw
          </button>
          <button
            onClick={() => { if (window.confirm('Resign this game?')) onResign(); }}
            className="py-2 px-3 rounded-md text-xs font-display tracking-wider
                       text-red-400 border border-red-500/25
                       hover:bg-red-500/8 transition-colors duration-150"
          >
            🏳 Resign
          </button>
        </div>
      )}
    </div>
  );
}