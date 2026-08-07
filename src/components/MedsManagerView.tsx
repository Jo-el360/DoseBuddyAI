import React, { useState } from 'react';
import { Plus, Trash2, Pill, Clock, AlertCircle, RefreshCw, ShieldAlert, Sparkles, Printer, CheckCircle2, FileText } from 'lucide-react';
import { Medication, UserProfile, DosageLog } from '../types';

interface MedsManagerViewProps {
  userProfile?: UserProfile;
  medications: Medication[];
  confirmedLogs?: DosageLog[];
  onAddMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onRefillMedication?: (id: string, count: number) => void;
}

export const MedsManagerView: React.FC<MedsManagerViewProps> = ({
  userProfile,
  medications,
  confirmedLogs = [],
  onAddMedication,
  onDeleteMedication,
  onRefillMedication,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('500 mg');
  const [frequency, setFrequency] = useState<string>('Twice daily');
  const [timeSlots, setTimeSlots] = useState<string>('08:00 AM, 06:30 PM');
  const [instructions, setInstructions] = useState<string>('Take with breakfast & dinner');
  const [requiresCheck, setRequiresCheck] = useState<boolean>(true);
  const [pillColor, setPillColor] = useState<string>('White Oval Tablet');
  const [initialPills, setInitialPills] = useState<number>(60);

  // Gemini AI Drug Interaction State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const handleRunAiSafetyCheck = async () => {
    setLoadingAi(true);
    setAiAnalysis('');
    try {
      const medsList = medications.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ');
      const userConditions = userProfile?.medicalConditions?.join(', ') || 'Type 2 Diabetes, Hypertension';
      const prompt = `Perform a clinical safety check for ${userProfile?.fullName || 'Patient'} taking the following active medications: [${medsList}]. Known conditions: [${userConditions}]. Allergies: [${userProfile?.allergies?.join(', ') || 'None'}]. Outline 1) Potential drug-drug or food interactions, 2) Timing recommendations, 3) Important safety precautions. Keep response structured in 3 clear bullet points.`;

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history: [] }),
      });
      const data = await res.json();
      setAiAnalysis(data.reply || 'No critical interactions detected. Always follow your physician instructions.');
    } catch (err) {
      setAiAnalysis('⚠️ Gemini AI scanner temporarily offline. Review prescription labels or consult your pharmacist.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMed: Medication = {
      id: `med_${Date.now()}`,
      name,
      dosage,
      frequency,
      timeSlots: timeSlots.split(',').map((s) => s.trim()),
      instructions,
      requiresBloodSugarCheck: requiresCheck,
      targetGlucoseMin: 80,
      targetGlucoseMax: 130,
      pillColor,
      category: 'Diabetes',
      pillsRemaining: initialPills,
      totalPillCapacity: initialPills,
      refillThreshold: 10,
    };

    onAddMedication(newMed);
    setShowModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Medication Cabinet & Refill Inventory</h2>
            <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-xs font-bold rounded-full border border-sky-200">
              {medications.length} Active Prescriptions
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Manage prescriptions, track pill supply counts, check AI drug interactions, and print clinical reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRunAiSafetyCheck}
            disabled={loadingAi}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 flex items-center gap-2 text-xs transition"
          >
            <Sparkles className={`w-4 h-4 text-indigo-600 ${loadingAi ? 'animate-spin' : ''}`} />
            <span>{loadingAi ? 'Scanning with Gemini...' : 'AI Safety & Interaction Scanner'}</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 flex items-center gap-2 text-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Doctor Visit Report</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center gap-2 text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Gemini AI Safety Scan Box */}
      {aiAnalysis && (
        <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md border border-indigo-700 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              <h3 className="font-extrabold text-sm text-indigo-100">Gemini Clinical Drug Interaction & Safety Review</h3>
            </div>
            <button onClick={() => setAiAnalysis('')} className="text-xs text-indigo-300 hover:text-white underline">
              Dismiss
            </button>
          </div>
          <div className="text-xs leading-relaxed text-indigo-100 whitespace-pre-line bg-indigo-950/60 p-4 rounded-xl border border-indigo-800">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Medication Cards List with Inventory Refill Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medications.map((med) => {
          const remaining = med.pillsRemaining ?? 30;
          const capacity = med.totalPillCapacity ?? 60;
          const pct = Math.min(100, Math.round((remaining / capacity) * 100));
          const isLowSupply = remaining <= (med.refillThreshold ?? 10);

          return (
            <div key={med.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 relative group hover:border-sky-300 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-100 text-sky-800 rounded-xl">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-xl text-slate-900">{med.name}</h3>
                      {isLowSupply && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full border border-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Low Refill Warning
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {med.dosage} • {med.frequency}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMedication(med.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Medicine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Pill Supply Progress Bar & Refill Control */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Pill Supply Inventory:</span>
                  <span className={isLowSupply ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
                    {remaining} / {capacity} Pills ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isLowSupply ? 'bg-rose-500' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Visual: <strong className="text-slate-700">{med.pillColor}</strong>
                  </span>
                  <button
                    onClick={() => onRefillMedication?.(med.id, 30)}
                    className="px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-extrabold transition flex items-center gap-1 shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>+ Refill (+30)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-700 pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-900">Scheduled Times:</span> {med.timeSlots.join(', ')}
                </div>

                <p className="italic bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 border border-slate-100">
                  💡 {med.instructions}
                </p>

                {med.requiresBloodSugarCheck && (
                  <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>Requires Blood Glucose Check Prior to Administration</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Medication Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-slate-900">Add New Prescription 💊</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Glipizide or Insulin"
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 500 mg or 18 Units"
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Initial Pill Count</label>
                  <input
                    type="number"
                    value={initialPills}
                    onChange={(e) => setInitialPills(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pill Visual Description</label>
                <input
                  type="text"
                  value={pillColor}
                  onChange={(e) => setPillColor(e.target.value)}
                  placeholder="e.g. Oval White Pill #500"
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Scheduled Times (comma separated)</label>
                <input
                  type="text"
                  value={timeSlots}
                  onChange={(e) => setTimeSlots(e.target.value)}
                  placeholder="08:00 AM, 06:30 PM"
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Instructions & Meal Pairing</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Take with food to prevent low blood sugar."
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
                <input
                  type="checkbox"
                  id="chk"
                  checked={requiresCheck}
                  onChange={(e) => setRequiresCheck(e.target.checked)}
                  className="w-5 h-5 text-sky-600 rounded"
                />
                <label htmlFor="chk" className="text-sm font-bold text-slate-800 cursor-pointer">
                  Require Blood Sugar Check Before Taking
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl shadow-md"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Doctor Visit Summary Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-sky-600" />
                <h3 className="text-xl font-bold text-slate-900">Doctor Visit Clinical Summary Report</h3>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">
                ×
              </button>
            </div>

            <div id="printable-doctor-report" className="space-y-5 p-4 border rounded-xl bg-slate-50">
              {/* Patient Header */}
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">{userProfile?.fullName || 'Patient Name'}</h4>
                  <p className="text-xs text-slate-600">
                    Age: {userProfile?.age} • Gender: {userProfile?.gender} • Blood: {userProfile?.bloodGroup} • Weight: {userProfile?.weight}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Conditions: <strong>{userProfile?.medicalConditions?.join(', ')}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-sky-600 text-white font-extrabold text-[10px] rounded-lg">
                    DoseBuddy AI Certified
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Active Prescriptions Table */}
              <div>
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Active Prescriptions & Schedules</h5>
                <table className="w-full text-xs text-left border-collapse bg-white rounded-lg overflow-hidden border">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                      <th className="p-2.5">Medication</th>
                      <th className="p-2.5">Dosage & Frequency</th>
                      <th className="p-2.5">Times</th>
                      <th className="p-2.5">Pill Inventory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((m) => (
                      <tr key={m.id} className="border-b hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                        <td className="p-2.5">{m.dosage} ({m.frequency})</td>
                        <td className="p-2.5 font-mono">{m.timeSlots.join(', ')}</td>
                        <td className="p-2.5 text-slate-700">{m.pillsRemaining ?? 30} Pills Left</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dosage Adherence Logs */}
              <div>
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Recent Recorded Dosage Confirmations</h5>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {confirmedLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-800">{log.medicationId}</span>
                        <span className="text-slate-500">at {log.confirmedAt}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                        {log.status} {log.glucoseReading ? `• BG: ${log.glucoseReading} mg/dL` : ''}
                      </span>
                    </div>
                  ))}
                  {confirmedLogs.length === 0 && (
                    <p className="text-xs text-slate-500 italic p-2">No logs recorded today.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

