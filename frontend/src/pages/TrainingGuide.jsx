import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Terminal, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  FileCode, 
  Activity, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Card from '../components/Card';

export default function TrainingGuide() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
          <span>Ultralytics YOLOv8 Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <GraduationCap className="w-7 h-7 text-cyan-400" />
          <span>Model Training Guide</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Comprehensive guide to fine-tuning YOLOv8 on aerial transmission tower defect datasets, interpreting objective evaluation metrics, and activating trained weights in Nova Grid.
        </p>
      </div>

      {/* Step 1: Virtual Environment Setup */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            01
          </span>
          <h2 className="text-base font-bold text-white">Environment & Dependencies</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Ensure you are operating inside the backend virtual environment with PyTorch and Ultralytics installed:
        </p>
        <pre className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
{`# Windows PowerShell / CMD
cd backend
venv\\Scripts\\activate

# Verify PyTorch and Ultralytics
python -c "import torch, ultralytics; print('PyTorch:', torch.__version__, '| CUDA Available:', torch.cuda.is_available())"`}
        </pre>
      </Card>

      {/* Step 2: Configure dataset.yaml */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            02
          </span>
          <h2 className="text-base font-bold text-white">Configure Dataset Specification</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Inspect and edit <code className="text-cyan-400 font-mono">backend/training/dataset.example.yaml</code> to verify relative paths match your extracted dataset:
        </p>
        <pre className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
{`# backend/training/dataset.yaml
path: ../datasets/transmission_towers
train: images/train
val: images/val
test: images/test

nc: 5
names:
  0: Damaged insulator
  1: Corrosion
  2: Missing component
  3: Damaged wire
  4: Other visible defect`}
        </pre>
      </Card>

      {/* Step 3: Execute train.py */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            03
          </span>
          <h2 className="text-base font-bold text-white">Run Training Script (train.py)</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Execute our modular training script. Use the <code className="text-cyan-400 font-mono">--copy-best</code> flag to automatically place best model weights into <code className="text-cyan-400 font-mono">backend/models/best.pt</code> upon completion:
        </p>
        <pre className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
{`# Execute from backend/training directory:
cd training

# Standard training run with automatic validation & best weights export:
python train.py --data dataset.example.yaml --model yolov8n.pt --epochs 50 --imgsz 640 --batch 16 --copy-best`}
        </pre>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>GPU vs. CPU Execution</span>
            </span>
            <p className="text-slate-400 leading-relaxed">
              If an NVIDIA CUDA GPU is detected, PyTorch accelerates training ~10–20x faster. On standard CPU, set <code className="text-cyan-400 font-mono">--epochs 10 --batch 8</code> for practical execution times.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Google Colab Tip</span>
            </span>
            <p className="text-slate-400 leading-relaxed">
              For free T4 GPU access, upload your dataset and <code className="text-amber-300 font-mono">train.py</code> to Google Colab. Train for 50 epochs in ~15 minutes, download <code className="text-white font-mono">best.pt</code>, and paste it into <code className="text-white font-mono">backend/models/</code>.
            </p>
          </div>
        </div>
      </Card>

      {/* Step 4: Metric Interpretation */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            04
          </span>
          <h2 className="text-base font-bold text-white">Interpreting Real Evaluation Metrics</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Never fabricate or guess metrics. When <code className="text-cyan-400 font-mono">train.py</code> finishes, it evaluates genuine performance on validation and test splits:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">Precision</span>
            <p className="text-xs text-slate-300">
              Fraction of detected faults that are genuine defects. High precision minimizes false alarms.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">Recall</span>
            <p className="text-xs text-slate-300">
              Fraction of actual transmission defects successfully detected. High recall prevents dangerous missed faults.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">mAP@50</span>
            <p className="text-xs text-slate-300">
              Mean Average Precision at Intersection-over-Union (IoU) threshold of 0.50. Primary benchmark for object detection.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">mAP@50-95</span>
            <p className="text-xs text-slate-300">
              Rigorous average across IoU thresholds from 0.50 to 0.95. Reflects bounding box tightness and boundary accuracy.
            </p>
          </div>
        </div>
      </Card>

      {/* Step 5: Activating in Backend */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            05
          </span>
          <h2 className="text-base font-bold text-white">Activate Weights in Backend</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Once your trained <code className="text-cyan-400 font-mono">best.pt</code> checkpoint is placed in <code className="text-cyan-400 font-mono">backend/models/best.pt</code>, restart the backend server:
        </p>
        <pre className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
{`# Restart Uvicorn server in backend/
venv\\Scripts\\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`}
        </pre>
        <p className="text-xs text-slate-400">
          The backend will automatically detect the file, read class labels directly from the PyTorch checkpoint header, and switch the frontend badge from <span className="text-amber-400 font-mono font-semibold">Demo Mode</span> to <span className="text-emerald-400 font-mono font-semibold">Trained Model Loaded</span>.
        </p>
      </Card>

      {/* Step 6: Testing with predict.py */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            06
          </span>
          <h2 className="text-base font-bold text-white">Standalone CLI Inference (predict.py)</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          You can also run quick offline evaluations on a folder of test images from the command line:
        </p>
        <pre className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
{`python predict.py --source ../datasets/transmission_towers/images/test --weights ../models/best.pt --conf 0.30`}
        </pre>
      </Card>
    </div>
  );
}
