import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  Server, 
  FileText, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  Radio
} from 'lucide-react';
import { AppSystemLog, UserProfile } from '../types';

interface AdminViewProps {
  userProfile?: UserProfile;
}

export const AdminView: React.FC<AdminViewProps> = ({ userProfile }) => {
  const [logs, setLogs] = useState<AppSystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'logs' | 'server'>('analytics');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.warn("Error fetching admin logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const activeName = userProfile?.fullName || 'Active Logged In User';
  const activeEmail = userProfile?.email || 'user@example.com';
  const activeRole = userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Patient';

  const mockUsers = [
    { id: 'usr_active', name: `${activeName} (Logged In)`, email: activeEmail, role: activeRole, status: 'Active Now', adherence: '98%', lastActive: 'Just now' },
    { id: 'usr_1', name: 'Maria Miller', email: 'maria.miller@example.com', role: 'Patient', status: 'Active', adherence: '94%', lastActive: '2 mins ago' },
    { id: 'usr_2', name: 'Dr. Carlos Miller', email: 'carlos@example.com', role: 'Caregiver', status: 'Active', fcmToken: 'fcm_token_carlos_m3', lastActive: '5 mins ago' },
    { id: 'usr_3', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@endocrinology.org', role: 'Doctor', status: 'Verified', lastActive: '1 hour ago' },
    { id: 'usr_4', name: 'System Administrator', email: 'admin@dosebuddy.ai', role: 'Admin', status: 'Active', lastActive: 'Active now' },
  ];

  const filteredLogs = logs.filter((l) => 
    l.event.toLowerCase().includes(searchFilter.toLowerCase()) || 
    l.details.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-sky-600 rounded-2xl border border-sky-400 flex items-center justify-center text-2xl shadow-sm">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">System Admin & Health Analytics Panel</h2>
              <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] uppercase font-bold rounded-full">
                Full-Stack Operational
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Monitoring Firebase Auth • Firestore Database Real-time Streams • Gemini API System Health
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Admin Metrics</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Registered Users</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">1,248</div>
          <p className="text-[11px] font-semibold text-emerald-600">+12% this week</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-bold">Daily Adherence Rate</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">92.4%</div>
          <p className="text-[11px] font-semibold text-emerald-600">Above target 90%</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-bold">Real-time SSE Clients</span>
            <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-slate-800">4 Active</div>
          <p className="text-[11px] font-semibold text-slate-500">Live SSE stream connected</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-bold">Gemini AI Latency</span>
            <Server className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">240 ms</div>
          <p className="text-[11px] font-semibold text-emerald-600">Gemini 3.6 Flash optimal</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'analytics' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Analytics & Reports
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'users' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Management ({mockUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'logs' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Real-time System Logs ({logs.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Medication Adherence Breakdown
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Confirmed On-Time</span>
                  <span className="text-emerald-600 font-extrabold">88%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[88%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Snoozed / Delayed</span>
                  <span className="text-amber-600 font-extrabold">8%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[8%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Missed (Caregiver Notified)</span>
                  <span className="text-rose-600 font-extrabold">4%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full w-[4%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Firebase & Server Cluster Status
            </h3>
            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span>Firebase Authentication</span>
                <span className="text-emerald-600 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span>Cloud Firestore Database</span>
                <span className="text-emerald-600 font-bold">SYNCHRONIZED</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span>Firebase Cloud Messaging (FCM)</span>
                <span className="text-emerald-600 font-bold">DISPATCH READY</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span>Gemini 3.6 Flash Engine</span>
                <span className="text-emerald-600 font-bold">HEALTHY</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Adherence</th>
                <th className="p-3.5">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold text-[10px] rounded-full border border-sky-100">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-emerald-600 font-bold">{u.status}</span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{u.adherence || 'N/A'}</td>
                  <td className="p-3.5 text-slate-400">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search logs by keyword..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-xs space-y-2 max-h-96 overflow-y-auto border border-slate-800">
            {filteredLogs.length === 0 ? (
              <p className="text-slate-500">No logs match criteria.</p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border-b border-slate-800/80 pb-1.5 flex gap-2">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className={`font-bold ${log.level === 'warning' ? 'text-amber-400' : 'text-sky-400'}`}>
                    [{log.event}]
                  </span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
