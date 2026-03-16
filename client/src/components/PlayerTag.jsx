import React from 'react';

export default function PlayerTag({ name, color, isActive, isYou }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-gold-400/10 rounded-lg px-4 py-2.5 w-full">
      <span className="text-xl">
        {color === "white" ? "♔" : "♚"}
      </span>

      <span className="font-body text-base text-gold-200 flex-1 truncate">
        {name || "Waiting…"}
        {isYou && <span className="text-ink-500 text-sm ml-1">(You)</span>}
      </span>

      <span
        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
          isActive
            ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse-slow"
            : "bg-ink-700"
        }`}
      />
    </div>
  );
}