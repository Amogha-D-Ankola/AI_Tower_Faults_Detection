import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Eye, 
  X, 
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Tooltip from '../components/Tooltip';

export default function Reports() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [reviewFilter, setReviewFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  
  const [activeModalItem, setActiveModalItem] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInspections({
        search: search.trim() || undefined,
        review_status: reviewFilter || undefined,
        mode: modeFilter || undefined,
      });
      setInspections(data);
    } catch (err) {
      setError(err.message || 'Failed to load inspection reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reviewFilter, modeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const openInspectionModal = async (id) => {
    try {
      const fullData = await api.getInspectionById(id);
      setActiveModalItem(fullData);
    } catch (err) {
      alert('Failed to retrieve full inspection details: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FileText className="w-7 h-7 text-cyan-400" />
          <span>Inspection Assessment Reports</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Formal engineering documentation and audit exports. Generated for utility inspectors and maintenance planners.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tower ID or location..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-navy-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="">All Verification Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-navy-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="">All Models</option>
              <option value="trained">Trained Weights Only</option>
              <option value="demo">Demo Mode Only</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold text-xs transition-colors shadow-glow-cyan"
            >
              Search
            </button>
          </div>
        </form>
      </Card>

      {/* Reports Listing */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading inspection reports from database...</p>
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Failed to Load Reports"
          description={error}
          actionText="Retry"
          onAction={fetchReports}
        />
      ) : inspections.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Inspection Reports Found"
          description="No completed inspections match your search criteria. Process an image in Upload & Detect to generate your first audit report."
          actionText="Create First Inspection"
          actionLink="/detect"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspections.map((insp) => (
            <Card key={insp.id} className="flex flex-col justify-between space-y-4 group">
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-mono font-bold text-base text-white group-hover:text-cyan-400 transition-colors">
                      {insp.tower_id}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ID: {insp.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      insp.review_status === 'Verified'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : insp.review_status === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {insp.review_status}
                  </span>
                </div>

                {/* Location & Date */}
                <div className="space-y-1 text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{insp.location || 'Location unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(insp.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Mode & Fault Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      insp.is_demo
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {insp.is_demo ? 'Demo Evaluation' : 'Trained Weights'}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                    {insp.fault_count} Suspected Fault{insp.fault_count !== 1 ? 's' : ''}
                  </span>
                  {insp.high_priority_count > 0 && (
                    <span className="text-[10px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded font-mono border border-rose-500/30">
                      {insp.high_priority_count} High
                    </span>
                  )}
                </div>

                {/* Thumbnail Image Preview */}
                <div className="rounded-xl overflow-hidden bg-navy-950 border border-slate-800 aspect-video mb-2">
                  <img
                    src={api.getImageUrl(insp.annotated_url)}
                    alt={`Annotated preview for ${insp.tower_id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => openInspectionModal(insp.id)}
                  className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white font-medium"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={api.getPdfReportUrl(insp.id)}
                    target="_blank"
                    rel="noreferrer"
                    title="Download Official PDF Assessment"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition-colors shadow-glow-cyan"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>

                  <a
                    href={api.getCsvReportUrl(insp.id)}
                    target="_blank"
                    rel="noreferrer"
                    title="Export CSV Telemetry"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                  >
                    <FileText className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Report View Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-mono text-xl font-bold text-white">
                    {activeModalItem.tower_id}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      activeModalItem.is_demo
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {activeModalItem.is_demo ? 'Demo Mode' : 'Trained Weights'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Report ID: {activeModalItem.id} • {new Date(activeModalItem.created_at).toUTCString()}
                </p>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Images in Modal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-slate-400">Original Drone Photo</span>
                <div className="rounded-xl overflow-hidden bg-navy-950 border border-slate-800 aspect-video flex items-center justify-center">
                  <img
                    src={api.getImageUrl(activeModalItem.original_url)}
                    alt="Original capture"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-cyan-400">Annotated Defect Localization</span>
                <div className="rounded-xl overflow-hidden bg-navy-950 border border-slate-800 aspect-video flex items-center justify-center">
                  <img
                    src={api.getImageUrl(activeModalItem.annotated_url)}
                    alt="Annotated capture"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Detections List in Modal */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3">
                Detected Defect Findings ({activeModalItem.fault_count})
              </h4>
              {activeModalItem.detections && activeModalItem.detections.length > 0 ? (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Fault Category</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3">Bounding Box</th>
                        <th className="py-2.5 px-3">Suggested Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {activeModalItem.detections.map((d, i) => (
                        <tr key={i}>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{i + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-white">{d.class_name}</td>
                          <td className="py-2.5 px-3 font-mono text-cyan-400">{(d.confidence * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            [{Math.round(d.x1)}, {Math.round(d.y1)}, {Math.round(d.x2)}, {Math.round(d.y2)}]
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-xs">{d.priority}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No supported defects detected above threshold.</p>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Human Review Status: <strong className="text-white">{activeModalItem.review_status}</strong>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={api.getPdfReportUrl(activeModalItem.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-glow-cyan"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Formal PDF Report</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
