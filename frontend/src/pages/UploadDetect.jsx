import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  Crosshair, 
  AlertTriangle, 
  FileText, 
  Download, 
  History, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import Card from '../components/Card';
import Tooltip from '../components/Tooltip';

export default function UploadDetect() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [towerId, setTowerId] = useState('');
  const [location, setLocation] = useState('');
  const [confidence, setConfidence] = useState(0.25);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [datasetGuideOpen, setDatasetGuideOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(selectedFile.type) && !['jpg', 'jpeg', 'png'].includes(ext)) {
      setError('Unsupported file type. Please select a JPG, JPEG, or PNG image.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit. Please select a smaller image.');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    // Suggest default Tower ID from filename if empty
    if (!towerId) {
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').toUpperCase();
      setTowerId(`TWR-${baseName.slice(0, 12)}`);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file to analyze.');
      return;
    }
    if (!towerId.trim()) {
      setError('Tower ID or image reference is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tower_id', towerId.trim());
    if (location.trim()) {
      formData.append('location', location.trim());
    }
    formData.append('confidence', confidence.toString());

    try {
      const data = await api.detectFaults(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Detection failed. Please check backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Crosshair className="w-7 h-7 text-cyan-400" />
          <span>Upload & Detect Transmission Faults</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Computer vision fault localization on aerial drone photography with calibrated confidence scoring.
        </p>
      </div>

      {/* Main Grid: Upload & Form vs Preview/Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Ingestion Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Drag-and-Drop Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Drone Inspection Image <span className="text-rose-400">*</span>
                </label>
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : file
                      ? 'border-cyan-500/50 bg-navy-950/60'
                      : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">
                    {file ? file.name : 'Click to select or drag & drop photo here'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    JPG, JPEG, or PNG (Max 10 MB)
                  </p>
                </div>
              </div>

              {/* Tower ID Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Tower ID / Image Reference <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-slate-500 font-normal">e.g. TWR-HV-401A</span>
                </label>
                <input
                  type="text"
                  required
                  value={towerId}
                  onChange={(e) => setTowerId(e.target.value)}
                  placeholder="e.g. TWR-LINE-772"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                />
              </div>

              {/* Optional Location Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Inspection Location (Optional)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Sector / Coordinates</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Grid Sector Delta, Span 12-13"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Confidence Threshold Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                  <div className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Confidence Threshold</span>
                    <Tooltip text="Minimum detection confidence required to register a candidate bounding box." />
                  </div>
                  <span className="font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {confidence.toFixed(2)} ({Math.round(confidence * 100)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer bg-slate-800 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0.05 (Sensitive)</span>
                  <span>0.25 (Default)</span>
                  <span>0.95 (Strict)</span>
                </div>
              </div>

              {/* Validation / Request Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !file}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy-950 font-bold text-sm transition-all shadow-glow-cyan"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running Neural Inference...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-4 h-4" />
                      <span>Run Fault Detection</span>
                    </>
                  )}
                </button>

                {(file || result) && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </Card>

          {/* Collapsible Public Dataset Information Section */}
          <Card className="p-4">
            <button
              onClick={() => setDatasetGuideOpen(!datasetGuideOpen)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-white hover:text-cyan-400 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Dataset Information & Permitted Sources</span>
              </div>
              {datasetGuideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {datasetGuideOpen && (
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-2.5 leading-relaxed">
                <p>
                  To test with real-world transmission imagery without infringing copyrighted drone footage, you can use open research datasets:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>Kaggle Transmission Tower Datasets:</strong> Search for "Transmission Tower Defect Detection" or "Insulator Defect".</li>
                  <li><strong>Roboflow Universe:</strong> Community datasets for powerline inspection and lattice defects.</li>
                  <li><strong>License Verification:</strong> Always verify CC-BY or Apache 2.0 terms before ingestion.</li>
                </ul>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                  Place extracted images in: <code className="text-white">backend/datasets/</code>
                </div>
                <div className="text-[11px] text-slate-500">
                  Note: Nova Grid intentionally does not auto-download large files over the network without user authorization.
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Preview & Detailed Detection Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Result or Preview Card */}
          {result ? (
            <div className="space-y-6">
              
              {/* Mode Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  result.is_demo
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold text-sm mb-0.5">
                    {result.is_demo
                      ? 'DEMO MODE — Base Weights Active'
                      : 'Trained Model Detections Active'}
                  </div>
                  <p>
                    {result.is_demo
                      ? 'This assessment ran with a generic base model for pipeline demonstration. Detected items ARE NOT certified transmission faults.'
                      : 'Detections produced by fine-tuned transmission tower weights.'}
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    * Mandatory Warning: All predictions require physical human verification by a certified inspector.
                  </p>
                </div>
              </div>

              {/* Side-by-Side Images (Original vs Annotated) */}
              <Card>
                <h3 className="text-sm font-bold text-white mb-3">Visual Localization Evidence</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[11px] font-mono text-slate-400 mb-1.5">
                      Original Capture ({result.image_width}×{result.image_height})
                    </span>
                    <div className="rounded-xl overflow-hidden bg-navy-950 border border-slate-800 aspect-video flex items-center justify-center">
                      <img
                        src={api.getImageUrl(result.original_url)}
                        alt="Original Drone Capture"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-mono text-cyan-400 mb-1.5">
                      AI Annotated ({result.fault_count} Detections)
                    </span>
                    <div className="rounded-xl overflow-hidden bg-navy-950 border border-slate-800 aspect-video flex items-center justify-center relative">
                      <img
                        src={api.getImageUrl(result.annotated_url)}
                        alt="Annotated Drone Capture"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Download and History Quick Actions */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
                  <a
                    href={api.getPdfReportUrl(result.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Assessment</span>
                  </a>

                  <a
                    href={api.getCsvReportUrl(result.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>

                  <Link
                    to={`/history`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors ml-auto"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View in History</span>
                  </Link>
                </div>
              </Card>

              {/* Detections Breakdown Table */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">
                    Candidate Defect Detections ({result.fault_count})
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Threshold: {result.confidence_threshold}
                  </span>
                </div>

                {result.fault_count > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Confidence</th>
                          <th className="py-2.5 px-3">Bounding Box [x1, y1, x2, y2]</th>
                          <th className="py-2.5 px-3">Review Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {result.detections.map((det, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-white">{det.class_name}</td>
                            <td className="py-2.5 px-3 font-mono text-cyan-400">
                              {(det.confidence * 100).toFixed(1)}%
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                              [{Math.round(det.x1)}, {Math.round(det.y1)}, {Math.round(det.x2)}, {Math.round(det.y2)}]
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  det.priority === 'High'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : det.priority === 'Medium'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {det.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">No supported faults detected</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      No defects met or exceeded the confidence threshold of {result.confidence_threshold}. 
                      <strong className="text-slate-200"> Note:</strong> This assessment does not confirm or imply that the transmission tower is safe or free of defects.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ) : previewUrl ? (
            /* Upload Preview before submission */
            <Card className="text-center py-10 space-y-4">
              <h3 className="text-sm font-bold text-white">Ready for Inference</h3>
              <div className="max-w-md mx-auto rounded-xl overflow-hidden bg-navy-950 border border-slate-800 aspect-video flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Upload Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click <strong>Run Fault Detection</strong> on the left panel to execute YOLO inference and generate bounding boxes.
              </p>
            </Card>
          ) : (
            /* Idle Placeholder */
            <Card className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-glow-cyan">
                <Crosshair className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Awaiting Drone Capture</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                Upload a transmission tower aerial image on the left panel to initiate object localization, review triage, and report generation.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
