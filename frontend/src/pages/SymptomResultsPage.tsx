import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  FileText,
  ShieldCheck,
  Stethoscope,
  Info,
  Phone,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { SymptomAnalysisResponse } from '../types';

export const SymptomResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<SymptomAnalysisResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('medisense_last_analysis');
    if (raw) {
      try {
        setAnalysis(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse cached analysis:', e);
      }
    }
  }, []);

  if (!analysis) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
        <Activity className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No Active Assessment Found</h2>
        <p className="text-sm text-slate-500">
          Please describe your symptoms to receive an evidence-grounded urgency evaluation.
        </p>
        <Link
          to="/symptom-checker"
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
        >
          Go to Symptom Checker
        </Link>
      </div>
    );
  }

  const {
    urgency_level,
    urgency_title,
    urgency_explanation,
    is_emergency,
    emergency_contact,
    extracted_symptoms,
    possible_conditions,
    diagnostic_suggestions,
    self_care_measures,
    when_to_seek_care,
    escalation_warning_signs,
    follow_up_questions,
    evaluation_engine,
    clinical_disclaimer,
  } = analysis;

  const isEmergency = urgency_level === 'EMERGENCY_CARE';
  const isSoon = urgency_level === 'SEE_DOCTOR_SOON';
  const isRoutine = urgency_level === 'ROUTINE_APPOINTMENT';

  const theme = isEmergency
    ? {
        border: 'border-rose-400',
        bg: 'bg-rose-50',
        badge: 'bg-rose-600 text-white',
        text: 'text-rose-900',
        icon: AlertTriangle,
      }
    : isSoon
    ? {
        border: 'border-amber-400',
        bg: 'bg-amber-50',
        badge: 'bg-amber-600 text-white',
        text: 'text-amber-900',
        icon: Clock,
      }
    : isRoutine
    ? {
        border: 'border-blue-300',
        bg: 'bg-blue-50',
        badge: 'bg-blue-600 text-white',
        text: 'text-blue-900',
        icon: Stethoscope,
      }
    : {
        border: 'border-emerald-300',
        bg: 'bg-emerald-50',
        badge: 'bg-emerald-700 text-white',
        text: 'text-emerald-950',
        icon: CheckCircle2,
      };

  const UrgencyIcon = theme.icon;

  const handleCreateDoctorSummary = () => {
    // Populate doctor summary input and navigate
    const rawInput = sessionStorage.getItem('medisense_last_input');
    const inputObj = rawInput ? JSON.parse(rawInput) : {};

    const summaryPayload = {
      main_concern: inputObj.description || extracted_symptoms.join(', '),
      symptoms: extracted_symptoms,
      onset: inputObj.onset,
      duration: inputObj.onset,
      progression: inputObj.progression,
      severity: inputObj.severity,
      associated_symptoms: inputObj.associated_symptoms || [],
      medical_history: inputObj.medical_history || [],
      current_medications: inputObj.current_medications || [],
      known_allergies: inputObj.known_allergies || [],
    };

    sessionStorage.setItem('medisense_doctor_summary_prep', JSON.stringify(summaryPayload));
    navigate('/doctor-summary');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Evaluation Result
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Symptom Guidance Summary
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/symptom-checker"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Assessment
          </Link>
          <button
            onClick={handleCreateDoctorSummary}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-1.5 rounded-lg shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Doctor Visit Summary
          </button>
        </div>
      </div>

      {/* 1. Urgency Level Banner Card */}
      <div className={`rounded-3xl border-2 ${theme.border} ${theme.bg} p-6 sm:p-8 space-y-4 shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${theme.badge}`}>
              <UrgencyIcon className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${theme.badge}`}>
                {urgency_level.replace(/_/g, ' ')}
              </span>
              <h2 className={`text-xl sm:text-2xl font-extrabold ${theme.text} mt-1`}>
                {urgency_title}
              </h2>
            </div>
          </div>

          <div className="text-xs bg-white/80 border border-slate-200/80 px-3 py-1 rounded-full text-slate-600 flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Mode: {evaluation_engine.includes('demo') ? 'Clinical Knowledge Base (Demo)' : 'AI Safety Evaluated'}</span>
          </div>
        </div>

        <p className={`text-sm leading-relaxed ${theme.text} font-medium`}>
          {urgency_explanation}
        </p>

        {/* Emergency Call Box if Emergency Level */}
        {isEmergency && (
          <div className="bg-rose-600 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
            <div>
              <p className="text-sm font-bold">Call Local Emergency Services Immediately</p>
              <p className="text-xs text-rose-100">
                In India, dial 112. In the US, dial 911. In the UK, dial 999. Do not drive yourself.
              </p>
            </div>
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 bg-white text-rose-700 font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:bg-rose-50 transition-colors"
            >
              <Phone className="w-4 h-4 fill-rose-600" />
              Call 112 (India)
            </a>
          </div>
        )}
      </div>

      {/* 2. Identified Symptoms Chip List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-700" />
          Identified Symptoms from Your Description
        </h3>
        <div className="flex flex-wrap gap-2">
          {extracted_symptoms.map((s, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-lg"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Possible Conditions (Explicitly labeled as possibilities, not diagnoses!) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-700" />
              Possible Explanations (Not Confirmed Diagnoses)
            </h3>
            <p className="text-xs text-slate-500">
              These are general possibilities based on reported patterns, not definitive medical conclusions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {possible_conditions.map((cond, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-teal-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-900 text-base">{cond.name}</h4>
                  {cond.professional_evaluation_needed && (
                    <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded whitespace-nowrap">
                      Evaluation Advised
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cond.simple_explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Typical Symptoms: </span>
                  <span className="text-slate-500">{cond.typical_symptoms.join(', ')}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Missing Information: </span>
                  <span className="text-slate-500 italic">{cond.missing_information_or_uncertainty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Diagnostic Suggestions a Clinician Might Consider */}
      {diagnostic_suggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              Investigations a Clinician Might Consider
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Doctors decide investigations after examining you. Medisense does not prescribe or order tests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {diagnostic_suggestions.map((diag, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                  {diag.category}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {diag.examples.map((ex, j) => (
                    <span key={j} className="text-xs bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                      {ex}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Why considered:</strong> {diag.why_clinician_considers}
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  {diag.important_note}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. General Self-Care & When to Seek Care */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supportive Self-Care */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            General Low-Risk Self-Care Measures
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            {self_care_measures.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-teal-600 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warning Signs Requiring Escalation */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Escalation Red Flags (Seek Prompt Care If):
          </h3>
          <ul className="space-y-2 text-xs text-rose-950 leading-relaxed">
            {escalation_warning_signs.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-rose-200 text-xs font-semibold text-rose-900">
            When to seek care: {when_to_seek_care}
          </div>
        </div>
      </div>

      {/* 6. Bottom Action Card: Doctor Consultation Prep CTA */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-teal-900 text-base">
            Planning to consult a physician?
          </h4>
          <p className="text-xs text-teal-800 max-w-lg">
            Convert these symptoms into a professional, printable report and speaking script with specific questions to ask your doctor.
          </p>
        </div>
        <button
          onClick={handleCreateDoctorSummary}
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3 rounded-xl shadow text-sm whitespace-nowrap transition-colors"
        >
          <FileText className="w-4 h-4" />
          Prepare Doctor Report
        </button>
      </div>

      {/* Disclaimer Note */}
      <p className="text-[11px] text-slate-500 text-center leading-relaxed">
        {clinical_disclaimer}
      </p>
    </div>
  );
};

