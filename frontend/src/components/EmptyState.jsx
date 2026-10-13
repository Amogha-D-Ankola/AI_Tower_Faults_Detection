import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionText, actionLink, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-navy-850/60 border border-slate-800 rounded-2xl text-center max-w-lg mx-auto my-6 shadow-card-glow">
      {Icon && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 shadow-glow-cyan">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>
      
      {actionLink && actionText && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-semibold text-sm hover:bg-cyan-400 transition-all shadow-glow-cyan hover:shadow-glow-cyan-lg"
        >
          {actionText}
        </Link>
      )}

      {onAction && actionText && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-semibold text-sm hover:bg-cyan-400 transition-all shadow-glow-cyan hover:shadow-glow-cyan-lg"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
