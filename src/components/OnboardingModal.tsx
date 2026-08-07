import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Sparkles, 
  HeartPulse, 
  Briefcase, 
  GraduationCap, 
  Home, 
  Plane, 
  Moon, 
  Sun,
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Pill,
  X
} from 'lucide-react';
import { UserProfile, DailyRoutineType } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State initialized from userProfile
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [age, setAge] = useState<number>(userProfile.age || 72);
  const [gender, setGender] = useState(userProfile.gender || 'Female');
  const [height, setHeight] = useState(userProfile.height || "5'4\"");
  const [weight, setWeight] = useState(userProfile.weight || '154 lbs');
  const [bloodGroup, setBloodGroup] = useState(userProfile.bloodGroup || 'O+');

  const [medicalConditions, setMedicalConditions] = useState<string>(
    userProfile.medicalConditions?.join(', ') || 'Type 2 Diabetes, Hypertension'
  );
  const [allergies, setAllergies] = useState<string>(
    userProfile.allergies?.join(', ') || 'Penicillin'
  );
  const [emergencyContact, setEmergencyContact] = useState(userProfile.emergencyContact || '+1 555-911-0000');
  const [caregiverContact, setCaregiverContact] = useState(userProfile.caregiverContact || '+1 555-888-9999 (Dr. Carlos)');

  // Routine & Time Slots
  const [dailyRoutine, setDailyRoutine] = useState<DailyRoutineType>(userProfile.dailyRoutine || 'Retired');
  const [wakeTime, setWakeTime] = useState(userProfile.wakeTime || '07:30 AM');
  const [sleepTime, setSleepTime] = useState(userProfile.sleepTime || '09:30 PM');
  const [breakfastTime, setBreakfastTime] = useState(userProfile.breakfastTime || '08:00 AM');
  const [lunchTime, setLunchTime] = useState(userProfile.lunchTime || '01:00 PM');
  const [dinnerTime, setDinnerTime] = useState(userProfile.dinnerTime || '06:30 PM');
  const [preferredLanguage, setPreferredLanguage] = useState(userProfile.preferredLanguage || 'English');

  if (!isOpen) return null;

  const handleFinish = () => {
    const updated: UserProfile = {
      ...userProfile,
      fullName,
      age: Number(age),
      gender,
      height,
      weight,
      bloodGroup,
      medicalConditions: medicalConditions.split(',').map((s) => s.trim()).filter(Boolean),
      allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyContact,
      caregiverContact,
      dailyRoutine,
      wakeTime,
      sleepTime,
      breakfastTime,
      lunchTime,
      dinnerTime,
      preferredLanguage,
      isOnboarded: true,
    };

    onSaveProfile(updated);
    onClose();
  };

  const routines: Array<{ type: DailyRoutineType; label: string; icon: any; desc: string }> = [
    { type: 'Office', label: 'Office Worker', icon: Briefcase, desc: '9-to-5 desk or professional environment' },
    { type: 'College', label: 'Student', icon: GraduationCap, desc: 'Classes, lectures, campus schedule' },
    { type: 'Home', label: 'Stay at Home / Remote', icon: Home, desc: 'Flexible daily schedule around home' },
    { type: 'Travelling', label: 'Frequent Traveller', icon: Plane, desc: 'Time zones, flights, moving schedule' },
    { type: 'Night Shift', label: 'Night Shift Worker', icon: Moon, desc: 'Late night duties, daytime sleep cycle' },
    { type: 'Retired', label: 'Retired Senior', icon: Sun, desc: 'Relaxed morning routines & active wellness' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Onboarding Header */}
        <div className="bg-sky-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 bg-sky-800 hover:bg-sky-700 text-sky-200 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-800 text-sky-300 rounded-2xl border border-sky-700">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300">
                Step {step} of 3 • Personal AI Tuning
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {step === 1 && 'Personal & Vitals Profile'}
                {step === 2 && 'Daily Schedule & Routine'}
                {step === 3 && 'Medical Context & Caregiver'}
              </h2>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-sky-950 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-sky-400 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Height
                  </label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Weight
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Preferred Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Your Primary Daily Routine (AI Context)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {routines.map((r) => {
                    const Icon = r.icon;
                    const isSelected = dailyRoutine === r.type;
                    return (
                      <button
                        key={r.type}
                        onClick={() => setDailyRoutine(r.type)}
                        className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                          isSelected 
                            ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/30' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                            {r.label}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {r.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Daily Timing Windows
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Wake-up Time</span>
                    <input
                      type="text"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Sleep Time</span>
                    <input
                      type="text"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Breakfast Time</span>
                    <input
                      type="text"
                      value={breakfastTime}
                      onChange={(e) => setBreakfastTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Dinner Time</span>
                    <input
                      type="text"
                      value={dinnerTime}
                      onChange={(e) => setDinnerTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Medical Conditions (Comma separated)
                </label>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Allergies (Comma separated)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Caregiver Contact
                  </label>
                  <input
                    type="text"
                    value={caregiverContact}
                    onChange={(e) => setCaregiverContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  Your profile will instantly tune Gemini AI to generate customized reminders specific to your {dailyRoutine} schedule!
                </span>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Complete Onboarding</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
