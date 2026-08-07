import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Medication, MedCategory } from '../types';

interface OCRScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractedMedication: (med: Partial<Medication>) => void;
}

export const OCRScanModal: React.FC<OCRScanModalProps> = ({
  isOpen,
  onClose,
  onExtractedMedication,
}) => {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [textDescription, setTextDescription] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartScan = async () => {
    if (!imageBase64 && !textDescription.trim()) {
      setErrorMsg('Please upload a photo of the medicine label/prescription OR type a description.');
      return;
    }

    setScanning(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          textDescription,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onExtractedMedication({
          name: data.data.name || 'Extracted Medicine',
          dosage: data.data.dosage || '1 Tablet',
          frequency: data.data.frequency || 'Once Daily',
          category: (data.data.category as MedCategory) || 'Diabetes',
          instructions: data.data.instructions || 'Take as directed.',
          pillColor: data.data.pillColor || 'Standard Pill',
          requiresBloodSugarCheck: Boolean(data.data.requiresBloodSugarCheck),
          foodRelation: data.data.foodRelation || 'after_food',
          imageUrl: imageBase64 || undefined,
        });
        onClose();
      } else if (data.fallback) {
        onExtractedMedication({
          name: data.fallback.name,
          dosage: data.fallback.dosage,
          frequency: data.fallback.frequency,
          category: 'Diabetes',
          instructions: data.fallback.instructions,
          pillColor: data.fallback.pillColor,
          requiresBloodSugarCheck: false,
          foodRelation: 'after_food',
          imageUrl: imageBase64 || undefined,
        });
        onClose();
      } else {
        setErrorMsg('Failed to process OCR label. Please try again or fill manually.');
      }
    } catch (err: any) {
      setErrorMsg('Server connection issue during Gemini OCR. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-indigo-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-800 text-indigo-300 rounded-2xl border border-indigo-700">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                Gemini 3.6 Multimodal Vision
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Scan Medicine Label / Prescription
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Area */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Upload Prescription or Bottle Photo
            </label>
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl p-6 text-center cursor-pointer relative transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imageBase64 ? (
                <div className="space-y-2">
                  <img 
                    src={imageBase64} 
                    alt="Uploaded Prescription" 
                    className="max-h-40 mx-auto rounded-xl border border-slate-200 shadow-sm"
                  />
                  <p className="text-xs font-bold text-indigo-700">Image Loaded! Click 'Run Gemini OCR' below.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto animate-bounce" />
                  <p className="text-xs font-bold text-slate-700">Click or Drag Prescription Image Here</p>
                  <p className="text-[10px] text-slate-400">Supports PNG, JPG, JPEG photos</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              OR Type Doctor's Note / Medicine Label Text
            </label>
            <textarea
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="e.g. Metformin HCL 500mg, Take 1 tablet twice daily after breakfast & dinner. Doctor note: Check blood glucose before morning dose."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleStartScan}
            disabled={scanning}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analyzing Label with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-300" />
                <span>Run Gemini Vision OCR & Auto-Fill</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
