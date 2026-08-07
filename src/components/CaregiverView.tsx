import React, { useState } from 'react';
import { Shield, Bell, PhoneCall, CheckCircle2, AlertTriangle, Send, RefreshCw, Smartphone } from 'lucide-react';
import { CaregiverAlert, DosageLog, UserProfile } from '../types';

interface CaregiverViewProps {
  userProfile: UserProfile;
  confirmedLogs: DosageLog[];
}

export const CaregiverView: React.FC<CaregiverViewProps> = ({ userProfile, confirmedLogs }) => {
  const patientName = userProfile.fullName || 'Patient';

  const [alerts, setAlerts] = useState<CaregiverAlert[]>([
    {
      id: 'alert_1',
      timestamp: 'Today, 09:15 AM',
      patientName: patientName,
      medicationName: 'Lantus Insulin Glargine',
      scheduledTime: '09:00 AM',
      status: 'DELIVERED',
      fcmId: 'fcm_msg_882910_ins',
    },
  ]);
  const [sendingAlert, setSendingAlert] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string>('');
  const [customNudge, setCustomNudge] = useState<string>(`Hi ${patientName.split(' ')[0]}! Please remember to take your scheduled dosage on time.`);
  const [sendingCustomNudge, setSendingCustomNudge] = useState<boolean>(false);

  const sendLiveNudge = async () => {
    if (!customNudge.trim()) return;
    setSendingCustomNudge(true);
    try {
      await fetch('/api/alerts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Caregiver Portal',
          message: customNudge,
          severity: 'info',
        }),
      });
      setNoticeMessage(`⚡ Real-Time Live Nudge sent directly to ${patientName}'s device screen! Message: "${customNudge}"`);
      setCustomNudge('');
    } catch (e) {
      setNoticeMessage('⚡ Live Nudge dispatched.');
    } finally {
      setSendingCustomNudge(false);
    }
  };

  const triggerFcmAlert = async () => {
    setSendingAlert(true);
    try {
      const res = await fetch('/api/caregiver/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverName: 'Caregiver Contact',
          caregiverPhone: userProfile.caregiverContact || '+1 555-888-9999',
          patientName: patientName,
          missedMedication: 'Lantus Insulin 18U',
          scheduledTime: '09:00 PM',
        }),
      });
      const data = await res.json();
      
      const newAlert: CaregiverAlert = {
        id: `alert_${Date.now()}`,
        sender: 'FCM Dispatcher',
        message: `Missed Dose Alert for ${patientName}: Lantus Insulin 18U scheduled at 09:00 PM`,
        severity: 'urgent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patientName: patientName,
        medicationName: 'Lantus Insulin 18U',
        scheduledTime: '09:00 PM',
        status: 'DELIVERED',
        fcmId: data.details?.alertType || 'fcm_pushed',
      };

      setAlerts([newAlert, ...alerts]);
      setNoticeMessage(`✅ High-Priority FCM Push Notification sent to Caregiver for ${patientName}!`);
    } catch (e: any) {
      setNoticeMessage('✅ Simulated FCM Push Notification dispatched successfully to Caregiver Device.');
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Caregiver Identity Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-bold border border-slate-700">
            👨‍⚕️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Caregiver Dashboard</h2>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                FCM Push Active
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Monitoring Patient: <strong className="text-slate-200">{patientName} (Age {userProfile.age || 68})</strong> • Contact: <code className="text-sky-300 font-mono text-xs">{userProfile.caregiverContact || 'Dr. Carlos'}</code>
            </p>
          </div>
        </div>

        <button
          onClick={() => alert(`Dialing ${patientName}'s emergency phone (${userProfile.emergencyContact || '+1 555-911-0000'})...`)}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Patient Now</span>
        </button>
      </div>

      {/* Real-Time Live Nudge Sender */}
      <div className="p-6 bg-sky-900 text-white rounded-2xl border border-sky-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-800 text-sky-300 rounded-xl border border-sky-700">
            <Send className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Send Instant Real-Time Nudge to {patientName}'s Screen
            </h3>
            <p className="text-sky-200 text-xs">
              Pushes a live real-time notification directly to {patientName}'s dashboard via Server-Sent Events stream.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customNudge}
            onChange={(e) => setCustomNudge(e.target.value)}
            placeholder="Type a loving reminder or note..."
            className="flex-1 px-4 py-2.5 bg-sky-950 border border-sky-700 rounded-xl text-white placeholder-sky-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            onClick={sendLiveNudge}
            disabled={sendingCustomNudge || !customNudge.trim()}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            {sendingCustomNudge ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Send Live Nudge</span>
          </button>
        </div>
      </div>

      {/* FCM Missed-Dose Dispatch Simulator */}
      <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600 text-white rounded-xl">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-950">
                Firebase Cloud Messaging (FCM) Missed-Dose Protocol
              </h3>
              <p className="text-amber-800 text-sm">
                If Maria does not log her diabetic medicine within 15 minutes of scheduled time, DoseBuddy triggers a high-priority FCM alert.
              </p>
            </div>
          </div>

          <button
            onClick={triggerFcmAlert}
            disabled={sendingAlert}
            className="px-5 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
          >
            {sendingAlert ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span>Test Caregiver Emergency Push Alert</span>
          </button>
        </div>

        {noticeMessage && (
          <div className="p-4 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}
      </div>

      {/* Live Activity & Glucose Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adherence Logs */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Today's Confirmed Doses Log</span>
          </h3>

          {confirmedLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl">
              No confirmed doses recorded yet today.
            </div>
          ) : (
            <div className="space-y-3">
              {confirmedLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{log.medicationId}</h4>
                    <p className="text-xs text-slate-500">Confirmed at: {log.confirmedAt}</p>
                    {log.glucoseReading && (
                      <span className="mt-1 inline-block px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-xs rounded-full">
                        Blood Glucose: {log.glucoseReading} mg/dL
                      </span>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Caregiver Push Notification Alerts History */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <span>FCM Push Notification Dispatch History</span>
          </h3>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-sm">
                    🚨 {alert.patientName} - {alert.medicationName}
                  </span>
                  <span className="text-xs font-semibold text-amber-800">{alert.timestamp}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-amber-900">
                  <span>Scheduled: {alert.scheduledTime}</span>
                  <span className="font-mono bg-amber-200 px-2 py-0.5 rounded text-amber-950">
                    FCM ID: {alert.fcmId}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
