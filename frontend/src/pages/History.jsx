import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';

export default function History() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  
  const [skip, setSkip] = useState(0);
  const limit = 10;

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInspections({
        skip,
        limit,
        search: search.trim() || undefined,
        review_status: statusFilter || undefined,
        mode: modeFilter || undefined,
      });
      setInspections(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve inspection history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [skip, statusFilter, modeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSkip(0);
    fetchHistory();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateReviewStatus(id, newStatus);
      showToast(`Updated inspection ${id.slice(0, 8)} status to ${newStatus}`);
      fetchHistory();
    } catch (err) {
      alert('Failed to update review status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteInspection(id);
      setDeleteConfirmId(null);
      showToast(`Deleted inspection record ${id.slice(0, 8)} and associated stored images.`);
      fetchHistory();
    } catch (err) {
      alert('Failed to delete inspection: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-cyan-500 text-navy-950 font-semibold text-xs shadow-glow-cyan flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <HistoryIcon className="w-7 h-7 text-cyan-400" />
          <span>Inspection Audit History</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Historical log of all processed drone image assessments with inspector verification tracking.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tower ID or location..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSkip(0);
              }}
              className="px-3 py-2 rounded-xl bg-navy-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="">All Review Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setSkip(0);
              }}
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
              Filter
            </button>
          </div>
        </form>
      </Card>

      {/* History Table */}
      <Card className="overflow-hidden p-0 sm:p-0">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading audit history records...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <EmptyState
              icon={AlertTriangle}
              title="Error Loading History"
              description={error}
              actionText="Retry"
              onAction={fetchHistory}
            />
          </div>
        ) : inspections.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={HistoryIcon}
              title="No Inspection Records Found"
              description="No inspections match the current filters or the database is currently empty."
              actionText="Start New Inspection"
              actionLink="/detect"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tower Reference</th>
                  <th className="py-3.5 px-4">Inspection Date</th>
                  <th className="py-3.5 px-4">Suspected Faults</th>
                  <th className="py-3.5 px-4">Predicted Categories</th>
                  <th className="py-3.5 px-4">Human Review Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Tower ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white flex items-center gap-2">
                        <span>{insp.tower_id}</span>
                        {insp.is_demo && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {insp.location || 'No location given'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      <div>{new Date(insp.created_at).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(insp.created_at).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Suspected Faults Count */}
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold ${insp.fault_count > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {insp.fault_count}
                      </span>
                      {insp.high_priority_count > 0 && (
                        <span className="ml-2 text-[10px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                          {insp.high_priority_count} High
                        </span>
                      )}
                    </td>

                    {/* Predicted Categories Pills */}
                    <td className="py-3.5 px-4">
                      {insp.categories && insp.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {insp.categories.map((c, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">None detected</span>
                      )}
                    </td>

                    {/* Review Status in-place selector */}
                    <td className="py-3.5 px-4">
                      <select
                        value={insp.review_status}
                        onChange={(e) => handleStatusChange(insp.id, e.target.value)}
                        className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                          insp.review_status === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : insp.review_status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <option value="Pending Review" className="bg-navy-950 text-amber-300">Pending Review</option>
                        <option value="Verified" className="bg-navy-950 text-emerald-300">Verified</option>
                        <option value="Rejected" className="bg-navy-950 text-rose-300">Rejected</option>
                      </select>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <a
                        href={api.getPdfReportUrl(insp.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 font-semibold text-[11px] border border-cyan-500/30 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Report</span>
                      </a>

                      <button
                        onClick={() => setDeleteConfirmId(insp.id)}
                        title="Delete Inspection Record"
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {inspections.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing records {skip + 1} to {skip + inspections.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - limit))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={inspections.length < limit}
                onClick={() => setSkip(skip + limit)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-white">Confirm Record Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete inspection record <code className="font-mono text-cyan-400">{deleteConfirmId.slice(0, 8)}</code>? This will permanently delete the inspection data and purge original and annotated image files from the server.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
