import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Pill, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  HeartPulse,
  XCircle,
  HelpCircle,
  BellRing
} from 'lucide-react';
import { Medication, DosageLog, UserProfile, DoseStatus } from '../types';

interface PatientViewProps {
  userProfile: UserProfile;
  medications: Medication[];
  isHighContrast: boolean;
  isLargeText: boolean;
  onConfirmDose: (medId: string, status?: DoseStatus, glucose?: number) => void;
  confirmedLogs: DosageLog[];
}

export const PatientView: React.FC<PatientViewProps> = ({
  userProfile,
  medications,
  isHighContrast,
  isLargeText,
  onConfirmDose,
  confirmedLogs,
}) => {
  const [bloodSugar, setBloodSugar] = useState<string>('112');
  const [aiReminder, setAiReminder] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string>('');
  const [activeAlarmMedication, setActiveAlarmMedication] = useState<Medication | null>(null);

  // Auto-request desktop OS notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Web Audio API Synthesizer - Real Loud Medical Alarm Chime
  const playAlarmChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Dual-tone Medical Alarm Chime (E5 -> G5)
      const playNote = (freq: number, delay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      playNote(659.25, 0, 0.4);   // E5
      playNote(783.99, 0.25, 0.5); // G5
      playNote(659.25, 0.6, 0.4);  // E5
      playNote(1046.50, 0.85, 0.8); // C6 bell
    } catch (_) {}
  };

  // Real-Time System Clock & Auto-Reminder Engine
  const [realtimeClock, setRealtimeClock] = useState<string>(() => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const [autoReminderActive] = useState<boolean>(true);
  const [triggeredKeys, setTriggeredKeys] = useState<Set<string>>(new Set());

  // Convert any 12h/24h time string like "08:00 AM", "8:00 AM", "2:40", "12:37 PM", "21:00" to minutes from midnight
  const parseTimeToMinutes = (t: string): number | null => {
    if (!t) return null;
    const clean = t.replace(/[\u202f\u00a0]/g, ' ').trim();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : null;

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    // Smart PM inference for afternoon times like "2:40" or "02:40"
    if (!period && hours > 0 && hours <= 7) hours += 12;

    return hours * 60 + minutes;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const rawTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setRealtimeClock(rawTimeStr);

      if (!autoReminderActive) return;

      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const todayDateStr = now.toDateString();

      for (const med of medications) {
        const doseLog = confirmedLogs.find(log => log.medicationId === med.id);
        if (doseLog?.status === 'TAKEN') continue;

        for (const slot of med.timeSlots) {
          const slotMinutes = parseTimeToMinutes(slot);
          if (slotMinutes === null) continue;

          const diff = nowMinutes - slotMinutes;
          const triggerKey = `${med.id}_${slot}_${todayDateStr}`;

          if (diff >= 0 && diff <= 3 && !triggeredKeys.has(triggerKey)) {
            setTriggeredKeys((prev) => new Set(prev).add(triggerKey));
            triggerNotificationForMed(med);
            break;
          }
        }
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [autoReminderActive, medications, triggeredKeys, confirmedLogs]);

  const triggerNotificationForMed = async (med?: Medication) => {
    const targetMed = med || medications[0];
    const medName = targetMed ? `${targetMed.name} (${targetMed.dosage})` : 'Metformin 500mg';
    const instructions = targetMed?.instructions || 'Take with food and water.';
    setTestStatus(`⚡ Alert Triggered: ${medName}`);
    if (targetMed) setActiveAlarmMedication(targetMed);

    // 1. Play Real Audible Alarm Chime Sound
    playAlarmChimeSound();

    // 2. Voice Speech Announcement
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const testText = `Attention ${userProfile.fullName || 'User'}! It is now ${realtimeClock}. Time for your scheduled dose of ${medName}. ${instructions}`;
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }

    // 3. Native Desktop Web Browser System Notification
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`💊 DoseBuddy Alarm: ${medName}`, {
          body: `Scheduled Time: ${realtimeClock}. Instructions: ${instructions}`,
          icon: '/favicon.png',
          requireInteraction: true,
        });
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(`💊 DoseBuddy Alarm: ${medName}`, {
            body: `Scheduled Time: ${realtimeClock}. Instructions: ${instructions}`,
            icon: '/favicon.png',
            requireInteraction: true,
          });
        }
      }
    }

    // 4. Trigger SSE Alert Payload to Caregiver
    try {
      await fetch('/api/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: userProfile.fullName,
          medicationName: medName,
          scheduledTime: realtimeClock,
        }),
      });
      setTestStatus(`✅ Live Alarm Triggered for ${medName}!`);
    } catch (err) {
      setTestStatus(`✅ Audio & Voice Alarm Triggered for ${medName}!`);
    }
  };

  // Fetch personalized AI reminder for active user profile
  useEffect(() => {
    fetchPersonalizedReminder(medications[0]);
  }, [medications, userProfile]);

  const fetchPersonalizedReminder = async (med?: Medication) => {
    const targetMed = med || medications[0];
    if (!targetMed) return;

    setLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/personalized-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          medication: targetMed,
          timeOfDay: 'Morning',
        }),
      });
      const json = await res.json();
      if (json.data) {
        setAiReminder(json.data);
      } else if (json.fallback) {
        setAiReminder(json.fallback);
      }
    } catch (err) {
      setAiReminder({
        greeting: `Good day, ${userProfile.fullName || 'there'}!`,
        reminderMessage: `It is time for your ${targetMed.name} (${targetMed.dosage}).`,
        routineTip: `Fits right into your ${userProfile.dailyRoutine || 'daily'} routine!`,
        safetyTip: "Please check your blood sugar level and take this medicine with a glass of water.",
        encouragement: "Keeping your medication routine consistent gives you great energy for the day!",
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const speakReminder = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-To-Speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    
    const textToSpeak = aiReminder 
      ? `${aiReminder.greeting || ''}. ${aiReminder.reminderMessage || ''} ${aiReminder.routineTip || ''} ${aiReminder.safetyTip || ''} ${aiReminder.encouragement || ''}`
      : `Good morning ${userProfile.fullName}. Please take your scheduled medicine with water.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = userProfile.age >= 65 ? 0.85 : 0.95; // Slower for seniors
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const getDoseLog = (medId: string) => {
    return confirmedLogs.find(log => log.medicationId === medId);
  };

  const takenCount = medications.filter(m => getDoseLog(m.id)?.status === 'TAKEN').length;
  const progressPercent = medications.length > 0 ? Math.round((takenCount / medications.length) * 100) : 0;

  return (
    <div className={`space-y-6 ${isHighContrast ? 'bg-yellow-50 text-black p-4 rounded-xl border-4 border-black' : ''}`}>
      {/* Active Scheduled Alarm Popup Modal */}
      {activeAlarmMedication && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-sky-500 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white text-center space-y-5 relative overflow-hidden">
            <div className="w-16 h-16 bg-sky-500/20 border border-sky-400/40 rounded-2xl flex items-center justify-center mx-auto text-sky-300 animate-bounce">
              <BellRing className="w-10 h-10 text-sky-400" />
            </div>
            <div>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase rounded-full tracking-wider">
                🚨 SCHEDULED REMINDER ALARM DUE NOW
              </span>
              <h3 className="text-2xl font-bold mt-2 text-white">
                {activeAlarmMedication.name} ({activeAlarmMedication.dosage})
              </h3>
              <p className="text-sky-200 text-sm mt-1">
                Scheduled for {realtimeClock}. {activeAlarmMedication.instructions}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onConfirmDose(activeAlarmMedication.id, 'TAKEN', parseFloat(bloodSugar));
                  setActiveAlarmMedication(null);
                }}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I TOOK THIS MEDICINE NOW</span>
              </button>
              <button
                onClick={() => setActiveAlarmMedication(null)}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Patient Welcome Header */}
      <div className={`p-6 rounded-2xl border ${isHighContrast ? 'bg-white border-4 border-black' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
              {userProfile.age >= 65 ? '👵' : '🧑‍⚕️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-bold text-slate-800 ${isLargeText ? 'text-3xl' : 'text-2xl'}`}>
                  Good Day, {userProfile.fullName || 'Maria'}!
                </h1>
                <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-100">
                  {userProfile.dailyRoutine || 'Retired'} Routine
                </span>
              </div>
              <p className={`text-slate-500 ${isLargeText ? 'text-lg' : 'text-sm'}`}>
                {userProfile.age} years old • {userProfile.medicalConditions?.join(', ') || 'Health Management'} • Caregiver: {userProfile.caregiverContact || 'Dr. Carlos'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
            <HeartPulse className="w-7 h-7 text-rose-500 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Daily Compliance</div>
              <div className="text-lg font-black text-slate-800">{takenCount} of {medications.length} Meds Confirmed</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs font-bold mb-1 text-slate-600">
            <span>Today's Adherence Progress</span>
            <span className="text-emerald-600 font-extrabold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Reminder Notification Test & Explanation Banner */}
      <div className={`p-5 rounded-2xl border ${isHighContrast ? 'bg-yellow-100 border-4 border-black text-black' : 'bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white shadow-md'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-sky-500/20 border border-sky-400/30 text-sky-300 rounded-xl flex-shrink-0 mt-0.5">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-white">How Reminders Work & Instant Test</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-extrabold rounded-full">
                  Real-Time SSE Active
                </span>
                <span className="px-2 py-0.5 bg-sky-500/20 text-sky-200 border border-sky-400/30 text-[10px] font-mono font-bold rounded-full">
                  🕒 Live Clock: {realtimeClock}
                </span>
              </div>
              <p className="text-sky-200 text-xs mt-1 leading-relaxed max-w-2xl">
                Reminders trigger automatically in 4 synchronized ways: <strong>1) Web Speech AI Voice Nudge</strong>, <strong>2) Floating Live Screen Banners</strong>, <strong>3) Browser System Popups</strong>, and <strong>4) Caregiver FCM Real-Time Push Alerts</strong>.
              </p>
              {testStatus && (
                <div className="mt-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800">
                  {testStatus}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => triggerNotificationForMed(medications[0])}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <BellRing className="w-4 h-4" />
              <span>Test Instant Reminder Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gemini AI Voice Nudge Companion Box */}
      <div className={`p-6 rounded-2xl ${isHighContrast ? 'bg-white border-4 border-black' : 'bg-indigo-900 text-white shadow-lg'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-800 text-indigo-300 rounded-xl border border-indigo-700">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className={`font-bold text-white ${isLargeText ? 'text-2xl' : 'text-xl'}`}>
                Gemini AI Health Insight & Voice Nudge
              </h2>
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-300">
                Personalized for {userProfile.fullName} ({userProfile.dailyRoutine} Routine)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPersonalizedReminder()}
              disabled={loadingAi}
              className="p-2 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-xl border border-indigo-700 flex items-center gap-1.5 text-xs font-semibold transition"
              title="Refresh AI reminder"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={speakReminder}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition ${
                isSpeaking 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'Reading Aloud...' : 'Listen Voice Nudge'}</span>
            </button>
          </div>
        </div>

        {loadingAi ? (
          <div className="p-8 text-center text-indigo-200 space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
            <p className="font-medium text-sm">Crafting {userProfile.fullName}'s personalized reminder with Gemini...</p>
          </div>
        ) : aiReminder ? (
          <div className="p-5 bg-indigo-950/60 rounded-xl border border-indigo-800 space-y-3">
            <p className={`font-semibold text-indigo-50 leading-relaxed ${isLargeText ? 'text-xl' : 'text-base'}`}>
              "{aiReminder.greeting || 'Hello!'} {aiReminder.reminderMessage}"
            </p>
            {aiReminder.routineTip && (
              <p className="text-sky-200 text-xs font-semibold">
                🎯 Routine Context: {aiReminder.routineTip}
              </p>
            )}
            {aiReminder.safetyTip && (
              <div className="p-3 bg-amber-500/10 border-l-4 border-amber-400 rounded text-amber-200 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{aiReminder.safetyTip}</span>
              </div>
            )}
            {aiReminder.encouragement && (
              <p className="text-emerald-300 text-xs font-medium italic">
                💚 {aiReminder.encouragement}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Blood Glucose Input Card */}
      <div className={`p-6 rounded-2xl border ${isHighContrast ? 'bg-white border-2 border-black' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-3 mb-3">
          <Activity className="w-6 h-6 text-rose-600" />
          <h3 className={`font-bold text-slate-800 ${isLargeText ? 'text-2xl' : 'text-xl'}`}>
            Blood Glucose Check (Before Meal)
          </h3>
        </div>
        <p className="text-slate-600 text-sm mb-4">
          Recording your blood sugar helps DoseBuddy AI adjust your safety tips and keeps caregivers updated in real-time.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="number"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
              placeholder="e.g. 110"
              className={`w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-sky-600 font-bold ${
                isLargeText ? 'text-2xl' : 'text-xl'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
              mg/dL
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-semibold text-sm w-full sm:w-auto justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Target Range: 80 - 130 mg/dL</span>
          </div>
        </div>
      </div>

      {/* Medication Checklist with 4 Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-slate-900 ${isLargeText ? 'text-2xl' : 'text-xl'}`}>
            Today's Prescribed Schedule
          </h3>
          <span className="text-sm font-semibold text-slate-500">
            Real-time synchronization active
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {medications.map((med) => {
            const log = getDoseLog(med.id);
            const status = log?.status;

            return (
              <div
                key={med.id}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  status === 'TAKEN'
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : status === 'SKIPPED'
                    ? 'bg-rose-50/80 border-rose-300'
                    : status === 'SNOOZED'
                    ? 'bg-amber-50/80 border-amber-300'
                    : status === 'HELP_NEEDED'
                    ? 'bg-purple-50/80 border-purple-300'
                    : isHighContrast
                    ? 'bg-white border-4 border-black'
                    : 'bg-white border-slate-200 shadow-md hover:border-sky-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      status === 'TAKEN' ? 'bg-emerald-600 text-white' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {status === 'TAKEN' ? <CheckCircle2 className="w-8 h-8" /> : <Pill className="w-8 h-8" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-black text-slate-900 ${isLargeText ? 'text-2xl' : 'text-xl'} ${status === 'TAKEN' ? 'line-through opacity-70' : ''}`}>
                          {med.name}
                        </h4>
                        <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 font-bold text-xs rounded-full border border-sky-200">
                          {med.dosage}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-full border border-slate-200">
                          {med.category}
                        </span>
                        {med.requiresBloodSugarCheck && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-xs rounded-full border border-rose-200 flex items-center gap-1">
                            🩸 Check Glucose
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-sky-600" />
                          {med.timeSlots.join(', ')} ({med.frequency})
                        </span>
                        <span>•</span>
                        <span>{med.pillColor}</span>
                      </div>

                      <p className={`text-slate-700 italic font-medium ${isLargeText ? 'text-lg' : 'text-sm'}`}>
                        💡 Instruction: {med.instructions}
                      </p>
                    </div>
                  </div>

                  {/* 4 Confirmation Buttons */}
                  <div className="flex-shrink-0 flex flex-wrap md:flex-nowrap gap-2">
                    <button
                      onClick={() => onConfirmDose(med.id, 'TAKEN', parseFloat(bloodSugar))}
                      disabled={status === 'TAKEN'}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition ${
                        status === 'TAKEN'
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{status === 'TAKEN' ? 'Taken' : 'Taken'}</span>
                    </button>

                    <button
                      onClick={() => onConfirmDose(med.id, 'SNOOZED', parseFloat(bloodSugar))}
                      className={`px-3 py-2.5 rounded-xl font-bold text-xs border shadow-sm flex items-center gap-1.5 transition ${
                        status === 'SNOOZED'
                          ? 'bg-amber-500 text-slate-950 border-amber-600'
                          : 'bg-slate-50 border-slate-200 hover:bg-amber-50 text-slate-700'
                      }`}
                    >
                      <BellRing className="w-4 h-4 text-amber-500" />
                      <span>Snooze (15m)</span>
                    </button>

                    <button
                      onClick={() => onConfirmDose(med.id, 'SKIPPED', parseFloat(bloodSugar))}
                      className={`px-3 py-2.5 rounded-xl font-bold text-xs border shadow-sm flex items-center gap-1.5 transition ${
                        status === 'SKIPPED'
                          ? 'bg-rose-600 text-white border-rose-700'
                          : 'bg-slate-50 border-slate-200 hover:bg-rose-50 text-slate-700'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Skip</span>
                    </button>

                    <button
                      onClick={() => {
                        onConfirmDose(med.id, 'HELP_NEEDED', parseFloat(bloodSugar));
                        alert("Caregiver alert dispatched! Assistance request logged.");
                      }}
                      className="px-3 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                    >
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      <span>Need Help</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
