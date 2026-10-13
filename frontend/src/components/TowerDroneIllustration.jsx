import React from 'react';

export default function TowerDroneIllustration({ className = 'w-full h-auto max-w-lg' }) {
  return (
    <svg
      viewBox="0 0 600 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Illustration of transmission tower and drone inspection scanning"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Scan Beam Gradients */}
        <linearGradient id="scanBeam" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
        </linearGradient>

        <linearGradient id="towerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#1E326E" />
        </linearGradient>
      </defs>

      {/* Background Target Radar Rings */}
      <circle cx="300" cy="220" r="180" stroke="#15224D" strokeWidth="1" strokeDasharray="4 6" />
      <circle cx="300" cy="220" r="120" stroke="#1E326E" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="300" cy="220" r="60" stroke="#22D3EE" strokeWidth="1" strokeOpacity="0.2" />

      {/* Grid Coordinates Overlay */}
      <line x1="120" y1="220" x2="480" y2="220" stroke="#1E326E" strokeWidth="0.75" strokeOpacity="0.4" />
      <line x1="300" y1="60" x2="300" y2="380" stroke="#1E326E" strokeWidth="0.75" strokeOpacity="0.4" />

      {/* Transmission Tower Lattice Structure */}
      {/* Tower Base & Legs */}
      <line x1="260" y1="390" x2="280" y2="120" stroke="url(#towerGradient)" strokeWidth="2.5" />
      <line x1="340" y1="390" x2="320" y2="120" stroke="url(#towerGradient)" strokeWidth="2.5" />
      
      {/* Foundation Feet */}
      <rect x="250" y="390" width="20" height="6" rx="2" fill="#22D3EE" fillOpacity="0.8" />
      <rect x="330" y="390" width="20" height="6" rx="2" fill="#22D3EE" fillOpacity="0.8" />

      {/* Lattice Cross-Bracing */}
      <line x1="265" y1="350" x2="335" y2="350" stroke="#2A4595" strokeWidth="1.5" />
      <line x1="265" y1="350" x2="330" y2="310" stroke="#2A4595" strokeWidth="1.2" />
      <line x1="335" y1="350" x2="270" y2="310" stroke="#2A4595" strokeWidth="1.2" />

      <line x1="270" y1="310" x2="330" y2="310" stroke="#2A4595" strokeWidth="1.5" />
      <line x1="270" y1="310" x2="325" y2="260" stroke="#2A4595" strokeWidth="1.2" />
      <line x1="330" y1="310" x2="275" y2="260" stroke="#2A4595" strokeWidth="1.2" />

      <line x1="275" y1="260" x2="325" y2="260" stroke="#2A4595" strokeWidth="1.5" />
      <line x1="275" y1="260" x2="320" y2="210" stroke="#2A4595" strokeWidth="1.2" />
      <line x1="325" y1="260" x2="280" y2="210" stroke="#2A4595" strokeWidth="1.2" />

      <line x1="280" y1="210" x2="320" y2="210" stroke="#2A4595" strokeWidth="1.5" />
      <line x1="280" y1="210" x2="318" y2="160" stroke="#2A4595" strokeWidth="1.2" />
      <line x1="320" y1="210" x2="282" y2="160" stroke="#2A4595" strokeWidth="1.2" />

      {/* Lower Crossarm */}
      <line x1="170" y1="210" x2="430" y2="210" stroke="#22D3EE" strokeWidth="2.5" />
      <line x1="210" y1="240" x2="280" y2="210" stroke="#1E326E" strokeWidth="1.5" />
      <line x1="390" y1="240" x2="320" y2="210" stroke="#1E326E" strokeWidth="1.5" />

      {/* Middle Crossarm */}
      <line x1="190" y1="160" x2="410" y2="160" stroke="#22D3EE" strokeWidth="2.5" />
      
      {/* Top Crossarm & Apex */}
      <line x1="210" y1="120" x2="390" y2="120" stroke="#22D3EE" strokeWidth="2" />
      <line x1="280" y1="120" x2="300" y2="70" stroke="#67E8F9" strokeWidth="2" />
      <line x1="320" y1="120" x2="300" y2="70" stroke="#67E8F9" strokeWidth="2" />
      <circle cx="300" cy="70" r="3" fill="#22D3EE" />

      {/* Ceramic Insulator Strings Hanging from Crossarms */}
      <g stroke="#67E8F9" strokeWidth="2">
        {/* Left Arm Insulator */}
        <line x1="180" y1="210" x2="180" y2="235" strokeDasharray="3 3" />
        <circle cx="180" cy="238" r="4" fill="#06B6D4" />
        
        {/* Right Arm Insulator with Suspected Fault Box */}
        <line x1="420" y1="210" x2="420" y2="235" strokeDasharray="3 3" />
        <circle cx="420" cy="238" r="4" fill="#F43F5E" />
      </g>

      {/* Simulated AI Detection Bounding Box on Defect */}
      <g>
        <rect
          x="398"
          y="200"
          width="44"
          height="48"
          rx="4"
          fill="none"
          stroke="#F43F5E"
          strokeWidth="1.8"
          strokeDasharray="4 2"
        />
        {/* Corner Marks */}
        <path d="M394 204 H398 V200" stroke="#F43F5E" strokeWidth="2" fill="none" />
        <path d="M446 204 H442 V200" stroke="#F43F5E" strokeWidth="2" fill="none" />
        <path d="M394 244 H398 V248" stroke="#F43F5E" strokeWidth="2" fill="none" />
        <path d="M446 244 H442 V248" stroke="#F43F5E" strokeWidth="2" fill="none" />
        
        {/* AI Tag */}
        <rect x="400" y="184" width="75" height="15" rx="3" fill="#F43F5E" />
        <text x="403" y="195" fill="#0A1128" fontSize="8" fontWeight="bold" fontFamily="monospace">
          DEFECT: 92.4%
        </text>
      </g>

      {/* Power Conductors (High Voltage Transmission Wires) */}
      <path d="M20 250 Q180 280 300 280 T580 250" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
      <path d="M20 220 Q180 250 300 250 T580 220" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />

      {/* Autonomous Inspection Drone */}
      <g transform="translate(430, 70)">
        {/* Sensor Cone / Scan Beam down to tower */}
        <polygon points="40,25 -80,150 15,160" fill="url(#scanBeam)" />

        {/* Drone Center Chassis */}
        <rect x="25" y="15" width="30" height="14" rx="4" fill="#0F1A3A" stroke="#22D3EE" strokeWidth="1.5" />
        
        {/* Optical Sensor Dome */}
        <circle cx="40" cy="27" r="4" fill="#22D3EE" filter="url(#softGlow)" />
        <circle cx="40" cy="27" r="1.5" fill="#FFFFFF" />

        {/* Drone Arms */}
        <line x1="15" y1="12" x2="65" y2="32" stroke="#67E8F9" strokeWidth="2" />
        <line x1="15" y1="32" x2="65" y2="12" stroke="#67E8F9" strokeWidth="2" />

        {/* Propeller Rotors */}
        <ellipse cx="14" cy="11" rx="14" ry="3" fill="#22D3EE" fillOpacity="0.4" stroke="#22D3EE" strokeWidth="0.8" />
        <ellipse cx="66" cy="11" rx="14" ry="3" fill="#22D3EE" fillOpacity="0.4" stroke="#22D3EE" strokeWidth="0.8" />
        <ellipse cx="14" cy="33" rx="14" ry="3" fill="#22D3EE" fillOpacity="0.4" stroke="#22D3EE" strokeWidth="0.8" />
        <ellipse cx="66" cy="33" rx="14" ry="3" fill="#22D3EE" fillOpacity="0.4" stroke="#22D3EE" strokeWidth="0.8" />

        {/* Status Beacon */}
        <circle cx="40" cy="14" r="2" fill="#10B981" filter="url(#softGlow)" />
      </g>

      {/* Floating Telemetry Box */}
      <g transform="translate(60, 90)">
        <rect x="0" y="0" width="130" height="54" rx="8" fill="#0A1128" fillOpacity="0.85" stroke="#1E326E" strokeWidth="1" />
        <circle cx="14" cy="16" r="3" fill="#10B981" />
        <text x="24" y="19" fill="#94A3B8" fontSize="9" fontFamily="sans-serif">TELEMETRY: ACTIVE</text>
        <text x="12" y="34" fill="#E2E8F0" fontSize="10" fontWeight="bold" fontFamily="monospace">ALT: 42.5m AGL</text>
        <text x="12" y="47" fill="#22D3EE" fontSize="10" fontFamily="monospace">FOV: TWR_QUAD_B</text>
      </g>
    </svg>
  );
}
