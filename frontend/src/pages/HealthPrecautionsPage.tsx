import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { ConditionPrecaution } from '../types';

export const HealthPrecautionsPage: React.FC = () => {
  const [conditions, setConditions] = useState<ConditionPrecaution[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<ConditionPrecaution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConditions()
      .then((data) => {
        setConditions(data || []);
        if (data && data.length > 0) {
          setSelectedCondition(data[0]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          <BookOpen className="w-4 h-4 text-teal-700" />
          <span>Evidence-Based Living & Chronic Health Guidance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Disease-Specific Precautions
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Comprehensive, evidence-based general precautions, warning signs, and medication cautions for common long-term conditions.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading health guides...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Condition Tabs */}
          <div className="lg:col-span-1 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Condition
            </span>
            <div className="space-y-1.5">
              {conditions.map((c) => {
                const isSelected = selectedCondition?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCondition(c)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs font-semibold ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed space-y-1">
                <span className="font-bold block">Educational Principle:</span>
                Medisense does not assume you have any disease based on symptoms alone. Always confirm health diagnoses with your physician.
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Condition Guide */}
          <div className="lg:col-span-3">
            {selectedCondition ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {selectedCondition.category}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                    {selectedCondition.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {selectedCondition.overview}
                  </p>
                </div>

                {/* General Precautions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Daily Precautions & Good Habits
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {selectedCondition.general_precautions.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-700 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warning Signs Requiring Escalation */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Critical Warning Signs (When to Call Doctor / Emergency)
                  </h3>
                  <ul className="space-y-2 text-xs text-rose-950 leading-relaxed bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                    {selectedCondition.warning_signs.map((ws, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-medium">
                        <span className="text-rose-600 font-bold">!</span>
                        <span>{ws}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lifestyle & Nutrition */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-teal-700" />
                    Lifestyle, Activity & Nutrition Considerations
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {selectedCondition.lifestyle_considerations.map((lc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-700 font-bold">→</span>
                        <span>{lc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Medication Cautions & Adherence */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Medication Cautions & Interactions to Avoid
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 leading-relaxed bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                    {selectedCondition.medication_cautions.map((mc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-700 font-bold">⚠</span>
                        <span>{mc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* When to Seek Care & Doctor Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      When to Seek Clinical Care
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedCondition.when_to_seek_care}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Questions for Next Appointment
                    </span>
                    <ul className="space-y-1 text-slate-600">
                      {selectedCondition.questions_to_ask_doctor.map((q, idx) => (
                        <li key={idx}>• {q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

