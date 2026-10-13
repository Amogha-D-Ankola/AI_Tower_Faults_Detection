import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldAlert, Cpu, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-slate-800 text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-wider text-white">
                NOVA<span className="text-cyan-400">GRID</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AI-Based Transmission Tower Fault Detection Using Drone Images.
            </p>
            <div className="font-mono text-[11px] text-cyan-400/90 font-medium">
              Tagline: Smarter Grids. Safer Power.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-sm">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Inspection Dashboard</Link></li>
              <li><Link to="/detect" className="hover:text-cyan-400 transition-colors">Upload & Detect</Link></li>
              <li><Link to="/history" className="hover:text-cyan-400 transition-colors">Audit History</Link></li>
              <li><Link to="/reports" className="hover:text-cyan-400 transition-colors">Inspection Reports</Link></li>
            </ul>
          </div>

          {/* Documentation & Guides */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-sm">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/dataset-prep" className="hover:text-cyan-400 transition-colors">Roboflow Dataset Prep</Link></li>
              <li><Link to="/training-guide" className="hover:text-cyan-400 transition-colors">YOLOv8 Training Guide</Link></li>
              <li><Link to="/about" className="hover:text-cyan-400 transition-colors">Architecture & Mission</Link></li>
              <li><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1">FastAPI Docs <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-sm">Architecture</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              FastAPI • SQLite • Ultralytics YOLOv8 • OpenCV • ReportLab • React 18 • Tailwind CSS
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full-Stack Local Pipeline</span>
            </div>
          </div>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-[11px] text-slate-300 leading-normal">
            <strong className="text-amber-300">Responsible AI Notice:</strong> Nova Grid produces preliminary machine vision assessments to assist inspection triage. Model predictions require verification by a qualified electrical engineer. Nova Grid never declares or certifies that any tower is safe or unsafe.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Nova Grid. Engineered for college hackathon & industrial research demonstration.</p>
          <p className="flex items-center gap-1">
            Built for infrastructure resilience & worker safety
          </p>
        </div>
      </div>
    </footer>
  );
}
