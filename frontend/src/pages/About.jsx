import React from 'react';
import { 
  Zap, 
  Cpu, 
  ShieldAlert, 
  Leaf, 
  CheckCircle2, 
  Layers, 
  AlertTriangle, 
  Code2, 
  Terminal, 
  HeartHandshake,
  BookOpen
} from 'lucide-react';
import Card from '../components/Card';

export default function About() {
  const techStack = [
    { layer: 'Frontend Framework', tech: 'React 18 + Vite', note: 'Fast component rendering with strict type-safe state isolation.' },
    { layer: 'Styling & Design System', tech: 'Tailwind CSS (Vanilla CSS)', note: 'Dark navy futuristic theme (#0A1128) with cyan (#22D3EE) accents.' },
    { layer: 'Data Visualization', tech: 'Recharts', note: 'Responsive defect category breakdown charts.' },
    { layer: 'Backend Server', tech: 'Python 3.10+, FastAPI, Uvicorn', note: 'Asynchronous REST API with CORS and OpenAPI docs.' },
    { layer: 'Computer Vision AI', tech: 'Ultralytics YOLOv8', note: 'Deep learning object detection with real bounding box localization.' },
    { layer: 'Image Processing', tech: 'OpenCV (Headless) + Pillow', note: 'Strict file byte validation and anti-aliased visual annotations.' },
    { layer: 'Audit Reports', tech: 'ReportLab (PDF) + Python CSV', note: 'Publication-quality vector PDF assessments with signature blocks.' },
    { layer: 'Persistence Layer', tech: 'SQLite via SQLAlchemy', note: 'Zero-config local relational database with cascading relations.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
          <span>Mission & Engineering Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Zap className="w-8 h-8 text-cyan-400" />
          <span>About Nova Grid</span>
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Tagline: <strong className="text-cyan-400">Smarter Grids. Safer Power.</strong> Nova Grid is an end-to-end aerial computer vision system designed to inspect high-voltage electrical transmission towers from drone captures.
        </p>
      </div>

      {/* Mission Statement Card */}
      <Card className="p-8 bg-gradient-to-br from-navy-850 to-navy-950 border-cyan-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Our Core Mission</h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          High-voltage transmission corridors span thousands of miles through rugged terrain, mountain passes, and dense forests. Traditional manual tower inspection requires utility workers to climb towering steel lattice structures or fly low in expensive helicopters. Nova Grid harnesses autonomous drone photography and Computer Vision to detect visible mechanical and electrical defects remotely, triaging urgent issues to certified engineers while minimizing hazardous field climbs.
        </p>
      </Card>

      {/* How the System Works */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">System Architecture & Pipeline Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 1</span>
            <h3 className="font-bold text-white text-sm">Aerial Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts high-resolution drone photography. Validates MIME headers, file byte integrity, and image dimensions via Pillow.
            </p>
          </Card>

          <Card className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 2</span>
            <h3 className="font-bold text-white text-sm">Neural Inference</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              YOLOv8 evaluates candidate bounding boxes and confidence scores against the trained 5-defect vocabulary.
            </p>
          </Card>

          <Card className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 3</span>
            <h3 className="font-bold text-white text-sm">Review Priority Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Heuristic rules map defect severity and model confidence into High, Medium, or Low suggested inspector priorities.
            </p>
          </Card>

          <Card className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 4</span>
            <h3 className="font-bold text-white text-sm">Audit Reporting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates formal ReportLab PDFs with visual comparisons, watermarks, inspector signature lines, and CSV exports.
            </p>
          </Card>
        </div>
      </div>

      {/* Technology Stack Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <span>Technology Stack</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            Stable Pinned Dependencies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">System Layer</th>
                <th className="py-2.5 px-3">Technology Selection</th>
                <th className="py-2.5 px-3">Engineering Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {techStack.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white">{row.layer}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400 font-medium">{row.tech}</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Responsible AI & Non-Negotiable Transparency Principles */}
      <Card className="border-amber-500/30 bg-navy-950 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Responsible AI & Technical Honesty Principles</h2>
            <p className="text-xs text-amber-300 font-medium">Core ethical constraints governing Nova Grid</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-white">1. Mandatory Human Verification</h3>
            <p className="text-slate-400">
              Every prediction is classified strictly as a <em>preliminary machine suggestion</em>. Real-world decisions (such as de-energizing high-voltage lines or replacing insulator strings) require physical or telephoto inspection by certified utility personnel.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white">2. No Safety Verdicts</h3>
            <p className="text-slate-400">
              Nova Grid <strong>never declares a tower safe or unsafe</strong>. Absence of detections indicates only that no supported defects exceeded the confidence threshold in the analyzed image field of view; it does not certify structural integrity.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white">3. Zero Fabricated Metrics</h3>
            <p className="text-slate-400">
              No statistics, prediction confidences, or model metrics are ever hardcoded or simulated. In demo mode, base weights and watermarks are visibly displayed to prevent misleading viewers.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white">4. Honest Sustainability Claims</h3>
            <p className="text-slate-400">
              We describe how remote visual inspections support route optimization and worker safety, but make <strong>no unverified quantitative claims</strong> regarding carbon offsets, fuel savings, or financial ROI without empirical field measurement.
            </p>
          </div>
        </div>
      </Card>

      {/* Real-World Limitations */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span>Real-World Computer Vision Limitations</span>
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <span><strong>Foliage & Optical Occlusion:</strong> Overgrown trees or steel lattice angle overlap can obscure small missing bolts.</span>
          </li>
          <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <span><strong>Sun Glare & Lighting Contrast:</strong> Direct backlighting can blow out ceramic insulator contours, reducing detection confidence.</span>
          </li>
          <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <span><strong>Camera Sensor Resolution:</strong> Identifying hairline insulator micro-cracks requires high-resolution zoom lenses (e.g. 48MP+).</span>
          </li>
          <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <span><strong>Subsurface & Internal Defects:</strong> Optical cameras cannot detect internal conductor core corrosion or electrical partial discharge without thermal/corona sensors.</span>
          </li>
        </ul>
      </Card>

      {/* Educational & College Hackathon Context */}
      <Card className="p-6 bg-slate-900/60 border-slate-800 text-center max-w-3xl mx-auto space-y-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-white text-base">Educational & Research Context</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Nova Grid was engineered as a comprehensive full-stack and computer vision reference implementation for students, hackathons, and industrial research. The codebase is organized in clean, modular components with rich documentation, enabling students to explore model training, real-time inference, and full-stack web integration.
        </p>
      </Card>
    </div>
  );
}
