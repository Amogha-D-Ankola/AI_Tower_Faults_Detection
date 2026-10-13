import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  FolderDown, 
  Tag, 
  Split, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import Card from '../components/Card';

export default function DatasetPrep() {
  const steps = [
    {
      num: 1,
      title: 'Collect Permitted Imagery',
      icon: FolderDown,
      desc: 'Gather high-resolution aerial transmission tower imagery from authorized drone flights or permitted public sources (such as Kaggle or academic repositories).',
      details: [
        'Verify dataset licensing (e.g. Creative Commons CC-BY, Apache 2.0).',
        'Capture diverse angles: close-ups of insulator strings, structural crossarms, and conductor attachments.',
        'Include varied lighting conditions (overcast, direct sun, dusk) to prevent model overfitting.',
      ],
    },
    {
      num: 2,
      title: 'Upload to Roboflow',
      icon: ExternalLink,
      desc: 'Create an account on Roboflow (roboflow.com) and create an Object Detection project.',
      details: [
        'Select "Object Detection" as your project type.',
        'Drag and drop raw JPG and PNG image files directly into the Roboflow web dashboard.',
        'Enable auto-orient and resize pre-processing if your source images exceed 4K resolution.',
      ],
    },
    {
      num: 3,
      title: 'Annotate Bounding Boxes & Assign Labels',
      icon: Tag,
      desc: 'Draw tight 2D bounding boxes around visible defects, aligning with the 5 core Nova Grid classes.',
      details: [
        'Keep boxes snug around defects; avoid excessive background margin.',
        'Be consistent: if an insulator string is cracked, label all cracked segments uniformly.',
        'Never invent labels: only mark genuine visual anomalies.',
      ],
    },
    {
      num: 4,
      title: 'Review Annotation Quality & Balance',
      icon: ShieldCheck,
      desc: 'Perform a comprehensive audit of labeling quality prior to generating a dataset version.',
      details: [
        'Check for missing labels: false negatives during training degrade model recall.',
        'Review class balance: aim for at least 50–100 annotated instances per supported class.',
        'Filter out out-of-focus or unidentifiable captures.',
      ],
    },
    {
      num: 5,
      title: 'Configure Train / Val / Test Splits',
      icon: Split,
      desc: 'Partition dataset partitions to measure model generalization without data leakage.',
      details: [
        'Recommended split: 70% Training, 20% Validation, 10% Testing.',
        'Ensure the same tower structure captured from multiple angles does not leak across both train and test splits.',
      ],
    },
    {
      num: 6,
      title: 'Export in YOLOv8 Format & Place in Backend',
      icon: Layers,
      desc: 'Download the generated Roboflow export zip and extract into the Nova Grid backend.',
      details: [
        'Choose "YOLOv8" as the export format in Roboflow.',
        'Extract the archive into backend/datasets/transmission_towers/.',
        'The export will produce data.yaml alongside images/train, images/val, and labels/ folders.',
      ],
    },
  ];

  const defaultClasses = [
    { id: 0, name: 'Damaged insulator', severity: 'High', desc: 'Broken sheds, chipped ceramic disks, flashover burn marks, or cracked porcelain.' },
    { id: 1, name: 'Corrosion', severity: 'Medium', desc: 'Visible rust, oxidized steel lattice members, peeling protective zinc galvanization.' },
    { id: 2, name: 'Missing component', severity: 'High', desc: 'Missing tower bolts, detached vibration dampers, or lost cotter pins.' },
    { id: 3, name: 'Damaged wire', severity: 'High', desc: 'Frayed conductor strands, broken shield wires, severe bird-cage deformations.' },
    { id: 4, name: 'Other visible defect', severity: 'Low', desc: 'Foreign debris (kites, plastic bags), bird nests, or structural lattice bending.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
          <span>External Annotation Workflow</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Layers className="w-7 h-7 text-cyan-400" />
          <span>Dataset Preparation Guide</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          High-quality labeled data is the foundation of trustworthy vision models. Follow this step-by-step workflow to label drone transmission tower defect images with Roboflow and format them for YOLOv8.
        </p>
      </div>

      {/* Recommended Supported Classes Reference Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Nova Grid Standard Fault Vocabulary</h2>
            <p className="text-xs text-slate-400">
              The 5 canonical classes configured in <code className="text-cyan-400 font-mono">dataset.example.yaml</code>.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            5 Configurable Classes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Class ID</th>
                <th className="py-2.5 px-3">Label Name</th>
                <th className="py-2.5 px-3">Base Severity</th>
                <th className="py-2.5 px-3">Defect Description & Visual Signatures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {defaultClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">{cls.id}</td>
                  <td className="py-3 px-3 font-semibold text-white">{cls.name}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        cls.severity === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : cls.severity === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {cls.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{cls.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Technical Honesty Note on Supported Classes */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-100 font-semibold">Strict Modeling Constraint:</strong> A class should only be treated as supported in production if sufficient labeled data exists in your training set and it has been empirically validated with non-zero precision and recall on held-out test splits.
          </p>
        </div>
      </Card>

      {/* Step-by-Step Guide Cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight">Step-by-Step Data Preparation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.num} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm shadow-glow-cyan">
                    {s.num}
                  </div>
                  <h3 className="font-bold text-white text-base">{s.title}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {s.desc}
                </p>

                <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  {s.details.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Folder Structure Diagram Card */}
      <Card>
        <h3 className="text-base font-bold text-white mb-2">Target Directory Structure</h3>
        <p className="text-xs text-slate-400 mb-4">
          After unzipping your Roboflow export, verify that the files are placed as follows:
        </p>

        <pre className="p-4 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`backend/
├── datasets/
│   └── transmission_towers/          # Root dataset directory
│       ├── dataset.yaml              # Auto-generated or custom YAML
│       ├── images/
│       │   ├── train/                # 70% training drone images (.jpg, .png)
│       │   ├── val/                  # 20% validation drone images
│       │   └── test/                 # 10% test drone images
│       └── labels/
│           ├── train/                # YOLO text annotations (.txt)
│           ├── val/
│           └── test/`}
        </pre>

        <div className="mt-5 flex justify-end">
          <Link
            to="/training-guide"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all"
          >
            <span>Proceed to Model Training Guide</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
