import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* Tiny reusable input */
const Field = ({ label, value, onChange, placeholder, maxLength, onKeyDown }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-display text-[0.6rem] tracking-[0.18em] text-gold-400/60 uppercase">
      {label}
    </label>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      onKeyDown={onKeyDown}
      className="
        bg-white/4 border border-gold-400/20 rounded-md
        px-4 py-3 text-gold-100 font-body text-lg outline-none
        placeholder:text-ink-600
        focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/10
        transition-all duration-200
      "
    />
  </div>
);

export default function Home() {
  const [name,    setName]    = useState('');
  const [roomId,  setRoomId]  = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const guard = () => {
    if (!name.trim()) { alert('Please enter your name'); return false; }
    return true;
  };

  const createRoom = async () => {
    if (!guard()) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/rooms', { method: 'POST' });
      const data = await res.json();
      navigate(`/game/${data.roomId}?name=${encodeURIComponent(name.trim())}`);
    } catch {
      alert('Could not reach server. Is it running on :5000?');
    }
    setLoading(false);
  };

  const joinRoom = () => {
    if (!guard()) return;
    if (!roomId.trim()) { alert('Enter a room code'); return; }
    navigate(`/game/${roomId.trim().toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
  };

  /* Checkerboard background squares */
  const squares = Array.from({ length: 64 }, (_, i) => ({
    light: (Math.floor(i / 8) + i) % 2 === 0,
  }));

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">

      {/* ── Checkerboard BG ─────────────────────────────────── */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-[0.06] pointer-events-none">
        {squares.map((sq, i) => (
          <div key={i} className={sq.light ? 'bg-board-light' : 'bg-board-dark'} />
        ))}
      </div>

      {/* ── Radial glow ─────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(200,169,126,0.08),transparent)] pointer-events-none" />

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center">
          <span className="text-7xl block animate-float drop-shadow-[0_0_30px_rgba(200,169,126,0.4)]">♚</span>
          <h1 className="font-display text-4xl font-black tracking-[0.15em] text-gold-400 mt-2
                         drop-shadow-[0_0_40px_rgba(200,169,126,0.3)]">
            GRAND CHESS
          </h1>
          <p className="font-body italic text-ink-300 tracking-widest text-sm mt-1">
            Multiplayer · Real-time · Strategic
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white/2.5 border border-gold-400/15 rounded-xl p-7
                        shadow-card backdrop-blur-sm flex flex-col gap-5">

          <Field
            label="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && createRoom()}
          />

          <button
            onClick={createRoom}
            disabled={loading}
            className="
              w-full py-3 rounded-md font-display text-sm font-bold tracking-wider
              bg-linear-to-r from-gold-400 to-gold-500 text-ink-900
              shadow-[0_4px_20px_rgba(200,169,126,0.3)]
              hover:shadow-[0_6px_30px_rgba(200,169,126,0.45)]
              hover:-translate-y-0.5 active:translate-y-0
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loading ? '⏳ Creating…' : '♟ Create New Game'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-ink-600">
            <div className="flex-1 h-px bg-gold-400/10" />
            <span className="font-display text-[0.58rem] tracking-[0.2em] uppercase">or join existing</span>
            <div className="flex-1 h-px bg-gold-400/10" />
          </div>

          <Field
            label="Room Code"
            value={roomId}
            onChange={e => setRoomId(e.target.value.toUpperCase())}
            placeholder="e.g. A3F8B2C1"
            maxLength={8}
            onKeyDown={e => e.key === 'Enter' && joinRoom()}
          />

          <button
            onClick={joinRoom}
            className="
              w-full py-3 rounded-md font-display text-sm font-bold tracking-wider
              bg-transparent text-gold-400 border border-gold-400/40
              hover:bg-gold-400/8 hover:border-gold-400/70
              transition-all duration-200
            "
          >
            ⚔ Join Game
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex gap-6 text-center">
          {[
            { icon: '⚡', label: 'Real-time' },
            { icon: '💾', label: 'Saved to DB' },
            { icon: '💬', label: 'Live Chat' },
          ].map(f => (
            <div key={f.label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{f.icon}</span>
              <span className="font-body text-xs text-ink-500">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}