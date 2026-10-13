import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Camera, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  ArrowUpRight, 
  Leaf, 
  FileText, 
  ExternalLink,
  Crosshair,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Tooltip from '../components/Tooltip';

const BAR_COLORS = ['#22D3EE', '#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#34D399'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/60 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-80 bg-slate-800/40 rounded-2xl"></div>
          <div className="lg:col-span-4 h-80 bg-slate-800/40 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={AlertTriangle}
          title="Backend Connection Error"
          description={`Could not connect to the Nova Grid backend: ${error}`}
          actionText="Retry Connection"
          onAction={loadStats}
        />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Drone Captures Inspected',
      value: stats?.total_inspections ?? 0,
      icon: Camera,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      tooltip: 'Real count of uploaded drone inspection captures stored in SQLite.'
    },
    {
      title: 'Total Suspected Faults',
      value: stats?.total_faults_detected ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      tooltip: 'Preliminary defects detected across trained inspections. Demo-mode records are isolated for honesty.'
    },
    {
      title: 'High Priority Alerts',
      value: stats?.high_priority_faults ?? 0,
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      tooltip: 'Defects whose category and confidence require expedited human inspector review.'
    },
    {
      title: 'Successfully Processed',
      value: stats?.successfully_processed ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      tooltip: 'Number of drone image files validated, processed, and stored without errors.'
    },
  ];

  const hasChartData = stats?.category_distribution && stats.category_distribution.length > 0;
  const recentInspections = stats?.recent_inspections || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Inspection Intelligence Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real telemetry from local SQLite database. Strictly zero fabricated metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Model Engine Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border ${
              stats?.model_status?.is_demo
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              {stats?.model_status?.is_demo ? 'Demo Mode Active' : 'Trained Weights Loaded'}
            </span>
          </div>

          <button
            onClick={loadStats}
            title="Refresh database statistics"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo Mode Notice Banner if Active */}
      {stats?.model_status?.is_demo && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong className="text-amber-100 font-semibold">DEMO MODE ACTIVE:</strong> No custom transmission tower weights detected in <code className="bg-navy-950 px-1 py-0.5 rounded text-amber-300">backend/models/best.pt</code>. The app is executing inference with standard base weights for demonstration purposes. Genuine defect totals will reflect custom trained model runs once weights are placed.
          </div>
        </div>
      )}

      {/* 4 Primary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mb-1">
                    <span>{card.title}</span>
                    <Tooltip text={card.tooltip} />
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-white tracking-tight mt-2">
                    {card.value}
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.bg} ${card.border} border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts & Sustainability Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Fault Category Distribution (Recharts) */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Defect Category Distribution</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown of detected visual anomalies across inspected towers.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                Recharts Visualizer
              </span>
            </div>

            {hasChartData ? (
              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={{ stroke: '#334155' }}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={{ stroke: '#334155' }}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#060B1A',
                        borderColor: '#1E326E',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#F8FAFC'
                      }}
                      cursor={{ fill: 'rgba(34, 211, 238, 0.05)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stats.category_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl my-4">
                <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-400">No defect category data recorded yet.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Run image detections on transmission tower captures to populate distribution analytics.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sustainability Summary Card (Section 5.8) */}
        <div className="lg:col-span-4">
          <Card className="h-full space-y-4 border-emerald-500/20 bg-gradient-to-b from-navy-850 to-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sustainability & Safety Impact</h3>
                <p className="text-[11px] text-emerald-400 font-medium">Environmental & Worker Benefits</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Nova Grid supports environmental sustainability and operational safety without making unverified quantitative claims:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>Reduces avoidable field trips:</strong> Aerial screening triages non-critical structures before deploying heavy utility trucks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>Prioritizes high-risk visits:</strong> Directs inspection crews straight to validated structural defects.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>Improves line-worker safety:</strong> Limits unnecessary high-altitude climbing on live transmission towers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>Early defect identification:</strong> Mitigates catastrophic insulator flashovers and brushfire hazards.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 italic">
              * Note: In compliance with responsible reporting, no measured fuel, emissions, or cost savings are claimed without direct utility telemetry.
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Recent Drone Inspections (Last 5)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest captures ingested into the Nova Grid inspection database.
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInspections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tower ID</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Suspected Faults</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentInspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-white flex items-center gap-2">
                      <span>{insp.tower_id}</span>
                      {insp.is_demo && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                          Demo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {insp.location || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {new Date(insp.created_at).toLocaleDateString()}
                    </td>
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
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        insp.review_status === 'Verified' 
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : insp.review_status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}>
                        {insp.review_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <a
                        href={api.getPdfReportUrl(insp.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl">
            <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No inspections logged in database.</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Upload your first drone transmission tower photo to see live analytics.
            </p>
            <Link
              to="/detect"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold text-xs transition-all shadow-glow-cyan"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Start First Inspection</span>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
