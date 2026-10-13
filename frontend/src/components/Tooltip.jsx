import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        aria-label={text}
        className="cursor-help inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors ml-1 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded"
      >
        {children || <Info className="w-3.5 h-3.5" />}
      </span>
      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-navy-950 border border-slate-700 text-slate-200 text-xs rounded-lg shadow-xl z-50 pointer-events-none transition-opacity"
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-950"></div>
        </div>
      )}
    </div>
  );
}
