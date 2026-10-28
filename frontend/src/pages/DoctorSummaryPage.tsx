import React, { useState, useEffect } from 'react';
import {
  FileText,
  Copy,
  Printer,
  Edit3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { DoctorSummaryResponse, DoctorSummaryRequest } from '../types';
import { Toast } from '../components/common/Toast';

export const DoctorSummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<DoctorSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editScript, setEditScript] = useState('');
  const [editConcern, setEditConcern] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Initial load: check if prepped data exists in sessionStorage
  useEffect(() => {
    const prepped = sessionStorage.getItem('medisense_doctor_summary_prep');
    if (prepped) {
      try {
        const payload: DoctorSummaryRequest = JSON.parse(prepped);
        setLoading(true);
        api.createDoctorSummary(payload)
          .then((res) => {
            setSummary(res);
            setEditScript(res.patient_speaking_script);
            setEditConcern(res.main_concern);
          })
          .catch((err) => console.error('Failed to generate summary:', err))
          .finally(() => setLoading(false));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default sample so the page is immediately functional
      const defaultSample: DoctorSummaryRequest = {
        main_concern: 'Headache and fatigue since yesterday',
        symptoms: ['Headache', 'Tiredness', 'Mild fever'],
        onset: 'Yesterday morning',
        progression: 'Staying steady',
        severity: 4,
        associated_symptoms: ['Mild body aches'],
        medical_history: [],
        current_medications: [],
        known_allergies: []
      };
      setLoading(true);
      api.createDoctorSummary(defaultSample)
        .then((res) => {
          setSummary(res);
          setEditScript(res.patient_speaking_script);
          setEditConcern(res.main_concern);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('Summary copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveEdit = () => {
    if (summary) {
      setSummary({
        ...summary,
        main_concern: editConcern,
        patient_speaking_script: editScript,
      });
      setIsEditing(false);
      setToastMessage('Report updated successfully!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
        <FileText className="w-12 h-12 text-teal-600 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Generating Consultation Summary...</h2>
        <p className="text-sm text-slate-500">
          Synthesizing your reported symptoms into a structured clinical presentation.
        </p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header with Print & Copy Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Consultation Preparation Tool
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Should I Tell My Doctor?
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear, non-technical speaking script and structured report to show or read to your doctor.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-700" />
            Edit Report
          </button>
          <button
            onClick={() => handleCopy(summary.patient_speaking_script)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-teal-700" />
            Copy Script
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header on printed document */}
        <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">
              Medisense Patient Consultation Brief
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Patient Symptom Summary
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Date: {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* 1. Natural Language Patient Speaking Script */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-700" />
              Suggested Opening Script (You Can Read or Show This)
            </span>
            <button
              onClick={() => handleCopy(summary.patient_speaking_script)}
              className="text-xs text-teal-800 hover:text-teal-950 font-semibold no-print flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>

          <p className="text-base sm:text-lg text-slate-800 italic leading-relaxed font-serif">
            {summary.patient_speaking_script}
          </p>
        </div>

        {/* 2. Structured Clinical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Primary Concern
            </span>
            <p className="font-semibold text-slate-900">{summary.main_concern}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Symptoms & Onset
            </span>
            <p className="text-slate-800">{summary.symptoms_and_onset}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Duration & Progression
            </span>
            <p className="text-slate-800">{summary.duration_and_progression}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Reported Severity Level
            </span>
            <p className="text-slate-800 font-semibold">{summary.severity_reported}</p>
          </div>
        </div>

        {/* 3. Medical Background Context (With accurate missing info labels!) */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Relevant Background & Safety Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="font-bold text-slate-500 uppercase block mb-1">
                Medical History:
              </span>
              <span className="text-slate-800 font-medium">
                {summary.medical_history_display}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="font-bold text-slate-500 uppercase block mb-1">
                Current Medications:
              </span>
              <span className="text-slate-800 font-medium">
                {summary.current_medications_display}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="font-bold text-slate-500 uppercase block mb-1">
                Known Drug Allergies:
              </span>
              <span className="text-slate-800 font-medium text-rose-700">
                {summary.known_allergies_display}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Questions to Ask the Doctor */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-teal-700" />
            Recommended Questions for Your Doctor
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {summary.questions_for_doctor.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-teal-700 mt-0.5">{idx + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Missing Information Alert (Guarantees no false assumptions) */}
        {summary.missing_information.length > 0 && (
          <div className="border-t border-slate-200 pt-6 space-y-2 text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-slate-600">
              Information Not Provided by User:
            </span>
            <ul className="list-disc pl-5 space-y-1">
              {summary.missing_information.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer on bottom of report */}
        <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 leading-relaxed text-center">
          {summary.disclaimer}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Edit Doctor Consultation Brief</h3>
            <p className="text-xs text-slate-500">
              Customize the speaking script or main concern before printing or sharing.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Primary Concern</label>
              <input
                type="text"
                value={editConcern}
                onChange={(e) => setEditConcern(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Speaking Script</label>
              <textarea
                rows={4}
                value={editScript}
                onChange={(e) => setEditScript(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

