import React from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Type, 
  Contrast, 
  Bell, 
  Volume2, 
  Download, 
  Smartphone, 
  Globe, 
  User, 
  ShieldCheck, 
  X,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  isLargeText: boolean;
  setIsLargeText: (val: boolean) => void;
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenOnboarding: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  isLargeText,
  setIsLargeText,
  isHighContrast,
  setIsHighContrast,
  isDarkMode,
  setIsDarkMode,
  onOpenOnboarding,
}) => {
  if (!isOpen) return null;

  const handleDownloadApk = () => {
    alert("DoseBuddy AI Android APK download started! File: DoseBuddy_v2.4_release.apk (18.4 MB)");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-600 text-white rounded-2xl shadow-md">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">App Settings & Profile</h2>
              <p className="text-xs text-slate-300 font-medium">Personalize Display, Notifications & Mobile Apps</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* User Profile Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-sky-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
                {userProfile.fullName ? userProfile.fullName.charAt(0) : 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{userProfile.fullName}</p>
                <p className="text-xs text-slate-500 font-semibold">
                  Role: <span className="capitalize text-sky-700">{userProfile.role}</span> • {userProfile.dailyRoutine} Routine
                </p>
              </div>
            </div>

            <button
              onClick={() => { onClose(); onOpenOnboarding(); }}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Edit Profile
            </button>
          </div>

          {/* Accessibility & Display Controls */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Accessibility & Display Modes
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Type className="w-4 h-4 text-sky-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Senior Large Text Mode</p>
                    <p className="text-[10px] text-slate-500">Increases font sizes for enhanced legibility</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isLargeText}
                  onChange={(e) => setIsLargeText(e.target.checked)}
                  className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Contrast className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">High Contrast Mode</p>
                    <p className="text-[10px] text-slate-500">High contrast yellow/black theme for vision impaired</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isHighContrast}
                  onChange={(e) => setIsHighContrast(e.target.checked)}
                  className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Dark Mode</p>
                    <p className="text-[10px] text-slate-500">Soft dark theme for eye comfort at night</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={(e) => setIsDarkMode(e.target.checked)}
                  className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Android APK & PWA Download */}
          <div className="p-4 bg-sky-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-sky-300" />
              <div>
                <p className="text-xs font-bold">Android APK & PWA Cross-Platform</p>
                <p className="text-[10px] text-sky-200">Install DoseBuddy directly on Android, iOS or Desktop</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleDownloadApk}
                className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK</span>
              </button>
              <button
                onClick={() => alert("PWA App is ready! Select 'Add to Home Screen' in your browser menu.")}
                className="flex-1 py-2 bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-sky-700 transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Install PWA</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
