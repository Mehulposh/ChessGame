import React, { useState, useRef, useEffect } from 'react';

export default function Chat({ messages, onSend, playerName }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h3 className="font-display text-[0.6rem] tracking-[0.18em] text-gold-400/50 uppercase mb-2">
        Chat
      </h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 min-h-20 max-h-64 pr-1">
        {messages.length === 0 ? (
          <p className="font-body italic text-ink-600 text-sm">No messages yet…</p>
        ) : (
          messages.map((msg, i) => {
            const mine = msg.playerName === playerName;
            return (
              <div key={i} className={`flex flex-col max-w-[90%] ${mine ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className="font-display text-[0.55rem] tracking-wider text-ink-500 mb-0.5">
                  {msg.playerName}
                </span>
                <span className={`font-body text-sm px-3 py-1.5 rounded-lg leading-snug break-words
                  ${mine
                    ? 'bg-gold-400/15 border border-gold-400/25 text-gold-100'
                    : 'bg-white/4 border border-white/8 text-ink-200'
                  }`}>
                  {msg.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Say something…"
          maxLength={100}
          className="
            flex-1 bg-white/4 border border-gold-400/20 rounded-md
            px-3 py-2 text-sm text-gold-100 font-body outline-none
            placeholder:text-ink-600
            focus:border-gold-400/50 transition-colors duration-150
          "
        />
        <button
          onClick={send}
          className="w-9 h-9 flex items-center justify-center rounded-md
                     bg-gold-400/15 border border-gold-400/30 text-gold-400
                     hover:bg-gold-400/25 transition-colors duration-150"
        >
          ↑
        </button>
      </div>
    </div>
  );
}