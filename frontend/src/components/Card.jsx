import React from 'react';

export default function Card({ children, className = '', glow = false, hover = true }) {
  return (
    <div
      className={`bg-navy-850/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 ${
        glow ? 'shadow-glow-cyan border-cyan-500/30' : 'shadow-card-glow'
      } ${
        hover ? 'hover:border-cyan-500/40 hover:shadow-glow-cyan' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
