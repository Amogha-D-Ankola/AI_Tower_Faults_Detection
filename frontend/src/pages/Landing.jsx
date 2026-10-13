import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Crosshair, 
  ArrowRight, 
  Layers, 
  FileCheck2, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Database,
  Cpu,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import TowerDroneIllustration from '../components/TowerDroneIllustration';
import Card from '../components/Card';

export default function Landing() {
  const scrollToWorkflow = () => {
    document.getElementById('workflow-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Collect Imagery',
      desc: 'Source high-resolution transmission tower captures from permitted public sources and drone surveys.',
      icon: Database,
    },
    {
      step: '02',
      title: 'Label Defects in Roboflow',
      desc: 'Annotate bounding boxes around damaged insulators, corrosion, missing components, and conductor wear.',
      icon: Layers,
    },
    {
      step: '03',
      title: 'Train YOLOv8 Architecture',
      desc: 'Fine-tune deep neural networks with our training script and evaluate honest precision, recall, and mAP metrics.',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'Detect & Prioritize',
      desc: 'Upload drone images for real-time bounding box localization, confidence scoring, and review priority triage.',
      icon: Crosshair,
    },
    {
      step: '05',
      title: 'Audit-Ready Reporting',
      desc: 'Generate comprehensive PDF and CSV inspection assessments with visual evidence and human sign-off blocks.',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="relative overflow-hidden bg-grid-pattern">
      {/* Top Subtle Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smarter Grids. Safer Power.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Nova Grid: AI-Based <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-200">
                Transmission Tower
              </span> Fault Detection
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Nova Grid combines drone imagery, Computer Vision, and AI to identify visible transmission tower defects, highlight suspected faults, and generate inspection reports. Our goal is to make power infrastructure inspection faster, safer, and more sustainable.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/detect"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-sm transition-all shadow-glow-cyan hover:shadow-glow-cyan-lg"
              >
                <Crosshair className="w-4 h-4" />
                <span>Start Inspection</span>
              </Link>

              <button
                onClick={scrollToWorkflow}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-slate-700 transition-all hover:border-slate-600"
              >
                <span>Explore Workflow</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Responsible AI Honesty Note Banner */}
            <div className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800/90 flex items-start gap-3 max-w-2xl mx-auto lg:mx-0 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-200 font-medium">Important Transparency Note:</strong> Nova Grid provides preliminary assistive computer vision triage. All detections require human verification by a qualified inspector before undertaking field interventions.
              </p>
            </div>
          </div>

          {/* Hero Right Visual Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-lg p-3 rounded-3xl bg-navy-850/40 border border-cyan-500/20 shadow-glow-cyan backdrop-blur-md">
              <TowerDroneIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for High-Voltage Infrastructure Inspection
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A complete, locally runnable pipeline bridging aerial visual collection with maintenance workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI-Powered Fault Detection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Specialized deep learning model trained on aerial transmission tower defect imagery. Detects damaged insulators, wire breaks, corrosion, and missing fasteners.
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <Crosshair className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Visual Bounding Box Detection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time OpenCV visualization with bounding boxes, calibrated confidence thresholds, and automated rules-based human review prioritization (High, Medium, Low).
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Inspection Reports</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generates formal, publication-grade PDF inspection assessment documents with visual comparisons and inspector sign-off lines, alongside CSV exports for maintenance logs.
            </p>
          </Card>
        </div>
      </section>

      {/* 5-Step Workflow Section */}
      <section id="workflow-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono mb-3 border border-slate-700">
            <span>End-to-End Pipeline</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            5-Step Computer Vision Inspection Workflow
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            How Nova Grid transforms raw drone aerial photography into structured maintenance actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {workflowSteps.map(({ step, title, desc, icon: Icon }, idx) => (
            <div key={step} className="relative group">
              <div className="h-full bg-navy-850/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-glow-cyan transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-cyan-400/40 group-hover:text-cyan-400 transition-colors">
                      {step}
                    </span>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-base mb-2">{title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Documented Step</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Honesty & Responsible AI Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80 mb-12">
        <div className="bg-navy-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-card-glow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-mono border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Ethical & Technical Integrity Principles</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Preliminary Triage, Not Autonomous Certification
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Nova Grid operates on the core principle of technical honesty. Transmission towers carry lethal high-voltage currents and critical grid reliability dependencies. Machine vision models can be subject to lighting glares, rain streaks, and motion blur.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                <li>Every result is clearly labeled as a preliminary machine assessment.</li>
                <li>The system never certifies a tower as "safe" or "unsafe".</li>
                <li>Zero fabricated metrics or seeded training results are ever presented.</li>
              </ul>
            </div>
            <div className="lg:col-span-4 flex justify-center">
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
              >
                <span>Read Full AI Ethics Statement</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
