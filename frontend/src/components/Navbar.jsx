import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Zap, 
  Menu, 
  X, 
  Cpu, 
  LayoutDashboard, 
  Crosshair, 
  History, 
  FileText, 
  Layers, 
  GraduationCap, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import Tooltip from './Tooltip';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await api.getModelStatus();
        setModelStatus(data);
      } catch (err) {
        // Fallback status if backend temporarily unreachable
        setModelStatus({ loaded: false, mode: 'demo', is_demo: true });
      }
    }
    fetchStatus();
    // Poll status periodically (every 30s)
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/detect', label: 'Upload & Detect', icon: Crosshair },
    { to: '/history', label: 'History', icon: History },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/dataset-prep', label: 'Dataset Prep', icon: Layers },
    { to: '/training-guide', label: 'Training Guide', icon: GraduationCap },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-navy-900/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 p-0.5 shadow-glow-cyan group-hover:shadow-glow-cyan-lg transition-all duration-300">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  NOVA<span className="text-cyan-400">GRID</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  AI CV
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight hidden lg:block">
                Smarter Grids. Safer Power.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Model Status Pill & CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {modelStatus && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                  modelStatus.is_demo
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    modelStatus.is_demo ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span>{modelStatus.is_demo ? 'Demo Mode' : 'Trained Model Loaded'}</span>
                <Tooltip
                  text={
                    modelStatus.is_demo
                      ? 'No custom tower fault weights loaded. Generic YOLO base pipeline active for demonstration.'
                      : 'Custom fine-tuned transmission tower weights active.'
                  }
                />
              </div>
            )}

            <Link
              to="/detect"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold text-xs transition-all shadow-glow-cyan hover:shadow-glow-cyan-lg"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapse Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-950 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2">
          {modelStatus && (
            <div className="py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Model Engine:</span>
              <span
                className={`font-mono font-medium ${
                  modelStatus.is_demo ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {modelStatus.is_demo ? 'Demo Mode (yolov8n)' : 'Trained Weights'}
              </span>
            </div>
          )}

          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 text-cyan-400" />
              <span>{label}</span>
            </NavLink>
          ))}
          
          <div className="pt-2">
            <Link
              to="/detect"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-bold text-sm shadow-glow-cyan"
            >
              <Crosshair className="w-4 h-4" />
              <span>Start New Inspection</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
