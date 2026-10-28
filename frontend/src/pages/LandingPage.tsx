import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Pill,
  CalendarCheck,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Heart,
  CheckCircle2,
  Sparkles,
  Phone
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickDemo = (query: string) => {
    navigate(`/symptom-checker?demo=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-100/80 text-teal-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI-Assisted Healthcare Companion • Clinical Safety First</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Understand Your Health.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-500">
              Make Informed Decisions.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Medisense helps you describe symptoms in your own words, understand medications in plain language, track daily doses, and walk into doctor appointments prepared.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/symptom-checker"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-7 py-3.5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <Activity className="w-5 h-5" />
              <span>Check Symptoms Safely</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/medicines"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-6 py-3.5 rounded-xl shadow-sm transition-all hover:border-slate-400"
            >
              <Pill className="w-5 h-5 text-teal-600" />
              <span>Look Up Medicines</span>
            </Link>

            <Link
              to="/medications"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-6 py-3.5 rounded-xl shadow-sm transition-all hover:border-slate-400"
            >
              <CalendarCheck className="w-5 h-5 text-teal-600" />
              <span>Medication Schedule</span>
            </Link>
          </div>

          {/* Quick Demo Shortcuts for Hackathon Judges / New Users */}
          <div className="mt-10 pt-6 border-t border-slate-200/80 max-w-2xl mx-auto">
            <p className="text-xs text-slate-500 font-medium mb-3">
              Explore with one-click test scenarios:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handleQuickDemo('I have had a mild headache since yesterday and feel tired.')}
                className="text-xs bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                🟢 Mild Headache & Fatigue (Home Care)
              </button>
              <button
                onClick={() => handleQuickDemo('I have had a continuous fever for 4 days with body aches.')}
                className="text-xs bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                🟠 Prolonged Fever for 4 Days (See Doctor Soon)
              </button>
              <button
                onClick={() => handleQuickDemo('Sudden crushing chest pain radiating to left arm with shortness of breath.')}
                className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                🔴 Severe Chest Pain (Emergency Protocol)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Four Core Pillars Designed for Patient Empowerment
          </h2>
          <p className="text-slate-600 text-sm mt-2 max-w-xl mx-auto">
            Clear healthcare information without scary jargon, built with rigorous clinical triage boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Symptom Checker</h3>
            <p className="text-slate-600 text-sm leading-relaxed flex-1">
              Describe how you feel in natural language. Receives a cautious 4-tier urgency recommendation (Emergency, Prompt Doctor, Routine, or Home Care) with no false reassurance.
            </p>
            <Link
              to="/symptom-checker"
              className="mt-4 text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Start Symptom Check <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Medicine Explainer</h3>
            <p className="text-slate-600 text-sm leading-relaxed flex-1">
              Type any brand or generic drug (e.g. Dolo 650, Metformin, Amoxicillin). Get simple-language uses, precautions, food interactions, and verified citations without invented dosages.
            </p>
            <Link
              to="/medicines"
              className="mt-4 text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Explore Drug Database <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Daily Dose Reminders</h3>
            <p className="text-slate-600 text-sm leading-relaxed flex-1">
              Keep your medication schedule organized. Record taken, skipped, or pending doses, track your weekly adherence streak, and receive browser-based alerts.
            </p>
            <Link
              to="/medications"
              className="mt-4 text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Manage Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Doctor Visit Prep</h3>
            <p className="text-slate-600 text-sm leading-relaxed flex-1">
              Transform confusing symptoms into an organized report and natural-language speaking script to share with your clinician. Ready to copy or print as PDF.
            </p>
            <Link
              to="/doctor-summary"
              className="mt-4 text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Generate Summary <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Safety Guardrails Commitment Banner */}
      <section className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 bg-teal-900/80 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full border border-teal-700">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Non-Negotiable Medical Ethics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Engineered for Safety, Not Reckless AI Diagnoses
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Medical information requires conservative boundaries. In Medisense, hardcoded clinical red-flag rules override any generative language model, verified pharmacology data is kept separate from general text, and unknown patient details are never fabricated.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Immediate 112 / 911 emergency triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Zero fabricated drug dosages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Offline deterministic clinical fallback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Local data privacy & no telemetry tracking</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-left space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-base">Emergency Numbers</h4>
                  <p className="text-xs text-slate-400">Keep these readily available</p>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-slate-700 pt-3">
                <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg">
                  <span className="text-slate-300">India Universal Emergency:</span>
                  <a href="tel:112" className="text-rose-400 font-bold hover:underline">112</a>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg">
                  <span className="text-slate-300">USA / Canada:</span>
                  <span className="text-slate-200 font-bold">911</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg">
                  <span className="text-slate-300">United Kingdom:</span>
                  <span className="text-slate-200 font-bold">999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

