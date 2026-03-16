import React, { useEffect, useRef } from 'react';

export default function MoveHistory({ moves }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moves]);

  // Group into pairs: [{ white, black }]
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className="flex flex-col min-h-0">
      <h3 className="font-display text-[0.6rem] tracking-[0.18em] text-gold-400/50 uppercase mb-2">
        Move History
      </h3>

      <div className="flex-1 overflow-y-auto max-h-52 space-y-0.5 pr-1">
        {pairs.length === 0 ? (
          <p className="font-body italic text-ink-600 text-sm">No moves yet…</p>
        ) : (
          pairs.map((pair, i) => (
            <div
              key={i}
              className={`grid grid-cols-[20px_1fr_1fr] gap-1 py-0.5 px-1 rounded text-sm font-mono
                ${i === pairs.length - 1 ? 'bg-gold-400/5' : ''}`}
            >
              <span className="text-ink-600 text-xs leading-5">{i + 1}.</span>
              <span className={`leading-5 ${i === pairs.length - 1 ? 'text-gold-300' : 'text-gold-100'}`}>
                {pair.white?.san}
              </span>
              <span className={`leading-5 ${i === pairs.length - 1 ? 'text-gold-400' : 'text-ink-300'}`}>
                {pair.black?.san ?? ''}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}