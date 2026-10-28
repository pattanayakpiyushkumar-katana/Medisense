import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Server,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Toast } from '../components/common/Toast';

export const PrivacySettingsPage: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExportData = () => {
    const exportedData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        exportedData[key] = localStorage.getItem(key);
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        exportedData[`session_${key}`] = sessionStorage.getItem(key);
      }
    }

    const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medisense-my-health-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage('Exported your local health data as JSON!');
  };

  const handleClearLocalData = () => {
    if (window.confirm('Are you sure you want to delete all cached health reports, reminders, and assessments stored in this browser?')) {
      localStorage.clear();
      sessionStorage.clear();
      setToastMessage('All local browser data cleared successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          <Lock className="w-4 h-4 text-teal-700" />
          <span>Patient Privacy & Control</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Privacy & Data Settings
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Health information is sacred. Review how Medisense protects your information and manage your local data storage.
        </p>
      </div>

      {/* AI Mode Transparency Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              AI Engine & Medical Knowledge Base Mode
            </h2>
            <p className="text-xs text-slate-500">
              Transparency on where health descriptions are evaluated
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span>Active Engine: Clinical Safety Rules & Offline Reference (Demo Mode)</span>
          </div>
          <p className="leading-relaxed">
            Medisense is currently running with its conservative, hardcoded rule engine and curated pharmacology catalog. Your queries are evaluated locally without sending unencrypted health records to third-party commercial advertising APIs.
          </p>
        </div>

        <div className="pt-2 text-xs text-slate-500 space-y-1">
          <p>
            <strong>Note for Production Deployment:</strong> When an AI API key is configured in the backend (.env), the system acts as a clinical validator, requiring strict schema conformance and never allowing external AI to override emergency triage guidelines.
          </p>
        </div>
      </div>

      {/* Data Protection Standards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-700" />
          Medisense Privacy Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">No Tracking / Telemetry</span>
            <p>We do not use Google Analytics, advertising pixels, or session recording scripts on health pages.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Data Minimization</span>
            <p>We do not ask for your real name, national ID, address, or phone number to check symptoms.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Local Data Separation</span>
            <p>Your browser local storage holds temporary drafts and reminders. No cloud synchronization without explicit login.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Right to Erasure</span>
            <p>You can export or purge all saved reminders, symptom drafts, and doctor summaries at any time below.</p>
          </div>
        </div>
      </div>

      {/* User Data Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Manage Your Stored Health Data
        </h2>
        <p className="text-xs text-slate-500">
          Export your medication logs and drafts for personal backup or permanently delete all locally cached records.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-teal-700" />
            Export My Data (JSON)
          </button>

          <button
            onClick={handleClearLocalData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 px-4 py-2.5 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            Delete All Local Data
          </button>
        </div>
      </div>
    </div>
  );
};

