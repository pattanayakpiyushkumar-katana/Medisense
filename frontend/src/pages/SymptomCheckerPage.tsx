import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Info,
  Clock,
  HelpCircle,
  Sparkles,
  Phone
} from 'lucide-react';
import { api } from '../services/api';
import { detectInstantEmergency, QuickEmergencyDetection } from '../utils/emergencyRules';
import { SymptomAnalysisRequest } from '../types';

const COMMON_SYMPTOMS = [
  'Headache',
  'Fever',
  'Cough',
  'Tiredness / Fatigue',
  'Sore Throat',
  'Shortness of Breath',
  'Chest Tightness',
  'Stomach / Abdominal Pain',
  'Nausea',
  'Body Aches',
  'Runny Nose',
  'Dizziness'
];

export const SymptomCheckerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form states
  const [description, setDescription] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [onset, setOnset] = useState('');
  const [severity, setSeverity] = useState<number>(3);
  const [progression, setProgression] = useState('steady');
  const [ageRange, setAgeRange] = useState('adult');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentMeds, setCurrentMeds] = useState('');
  const [knownAllergies, setKnownAllergies] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instantAlert, setInstantAlert] = useState<QuickEmergencyDetection | null>(null);

  // Pre-fill if demo parameter present
  useEffect(() => {
    const demoQuery = searchParams.get('demo');
    if (demoQuery) {
      setDescription(demoQuery);
      if (demoQuery.toLowerCase().includes('chest pain')) {
        setSelectedSymptoms(['Chest Tightness']);
        setSeverity(9);
      } else if (demoQuery.toLowerCase().includes('fever')) {
        setSelectedSymptoms(['Fever', 'Body Aches']);
        setOnset('2-3 days ago');
        setSeverity(6);
      } else if (demoQuery.toLowerCase().includes('headache')) {
        setSelectedSymptoms(['Headache', 'Tiredness / Fatigue']);
        setOnset('yesterday');
        setSeverity(3);
      }
    }
  }, [searchParams]);

  // Real-time instant emergency red flag detection
  useEffect(() => {
    const combinedText = `${description} ${selectedSymptoms.join(' ')}`;
    const detected = detectInstantEmergency(combinedText);
    setInstantAlert(detected);
  }, [description, selectedSymptoms]);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && selectedSymptoms.length === 0) {
      setError('Please provide a brief description of your symptoms or pick from the common symptoms list.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: SymptomAnalysisRequest = {
      description: description.trim() || selectedSymptoms.join(', '),
      selected_symptoms: selectedSymptoms,
      onset: onset || undefined,
      severity,
      progression,
      age_range: ageRange,
      medical_history: medicalHistory ? medicalHistory.split(',').map((s) => s.trim()) : [],
      current_medications: currentMeds ? currentMeds.split(',').map((s) => s.trim()) : [],
      known_allergies: knownAllergies ? knownAllergies.split(',').map((s) => s.trim()) : [],
    };

    try {
      const response = await api.analyzeSymptoms(payload);
      // Store in sessionStorage so results page can display and user can refresh
      sessionStorage.setItem('medisense_last_analysis', JSON.stringify(response));
      sessionStorage.setItem('medisense_last_input', JSON.stringify(payload));
      navigate('/symptom-results');
    } catch (err: any) {
      console.error('Symptom triage error:', err);
      setError(err.message || 'Unable to connect to analysis engine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityLabel = (val: number) => {
    if (val <= 3) return 'Mild Discomfort (Manageable at rest)';
    if (val <= 6) return 'Moderate (Disrupting daily activities)';
    if (val <= 8) return 'Severe (Significant pain or distress)';
    return 'Extreme / Emergency Severity (Needs immediate evaluation)';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Interactive Clinical Safety Screening</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Smart Symptom Checker
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Describe your symptoms in everyday language. Medisense checks for clinical emergency red flags first, then provides a cautious urgency recommendation.
        </p>
      </div>

      {/* Real-time Instant Emergency Alert Box (Triggers before submit if high-risk detected) */}
      {instantAlert && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 shadow-sm text-left animate-in fade-in-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                  High Risk Warning
                </span>
                <h3 className="text-base font-bold text-rose-900">{instantAlert.title}</h3>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed font-medium">
                {instantAlert.reason}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-rose-200">
                <span className="text-xs text-rose-900 font-semibold">
                  {instantAlert.action}
                </span>
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call 112 Immediately
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Error notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Free Text Description */}
        <div className="space-y-2">
          <label htmlFor="symptom-desc" className="block text-sm font-bold text-slate-800">
            1. Describe your symptoms in your own words
          </label>
          <p className="text-xs text-slate-500">
            Explain what you are feeling, where it hurts, and when it started.
          </p>
          <textarea
            id="symptom-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. I have had a headache since yesterday afternoon, feel very tired, and have a mild fever with body aches..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Section 2: Quick Common Symptoms Chips */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            2. Select any matching symptoms (Optional shortcut)
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {COMMON_SYMPTOMS.map((symp) => {
              const active = selectedSymptoms.includes(symp);
              return (
                <button
                  type="button"
                  key={symp}
                  onClick={() => toggleSymptom(symp)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    active
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-slate-100'
                  }`}
                >
                  {active ? `✓ ${symp}` : `+ ${symp}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Timeline & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {/* Onset */}
          <div className="space-y-1.5">
            <label htmlFor="onset-select" className="block text-xs font-bold text-slate-700">
              When did symptoms begin?
            </label>
            <select
              id="onset-select"
              value={onset}
              onChange={(e) => setOnset(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select onset timeframe</option>
              <option value="Just started today (few hours ago)">Just started today (few hours ago)</option>
              <option value="Started yesterday">Started yesterday</option>
              <option value="2 to 3 days ago">2 to 3 days ago</option>
              <option value="4 to 7 days ago">4 to 7 days ago</option>
              <option value="More than a week ago">More than a week ago</option>
              <option value="Several weeks or months (chronic)">Several weeks or months (chronic)</option>
            </select>
          </div>

          {/* Progression */}
          <div className="space-y-1.5">
            <label htmlFor="prog-select" className="block text-xs font-bold text-slate-700">
              How are symptoms progressing?
            </label>
            <select
              id="prog-select"
              value={progression}
              onChange={(e) => setProgression(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="steady">Staying about the same</option>
              <option value="improving">Gradually improving</option>
              <option value="worsening">Steadily getting worse</option>
              <option value="fluctuating">Fluctuating (comes and goes)</option>
            </select>
          </div>
        </div>

        {/* Severity Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <label htmlFor="severity-range" className="text-xs font-bold text-slate-700">
              Self-Reported Discomfort / Pain Level (1 to 10)
            </label>
            <span className="font-mono text-sm font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Level {severity} / 10
            </span>
          </div>
          <input
            id="severity-range"
            type="range"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full accent-teal-700 cursor-pointer"
          />
          <p className="text-xs text-slate-500 font-medium">
            {getSeverityLabel(severity)}
          </p>
        </div>

        {/* Section 4: Voluntary Context */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Voluntary Context (Helps provide safer guidance)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age-select" className="block text-xs font-medium text-slate-700 mb-1">
                Age Category
              </label>
              <select
                id="age-select"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="adult">Adult (18 - 64 years)</option>
                <option value="older adult (65+)">Older Adult (65+ years)</option>
                <option value="child (1-12)">Child (1 - 12 years)</option>
                <option value="infant">Infant (&lt; 1 year - High Alert)</option>
              </select>
            </div>

            <div>
              <label htmlFor="known-conditions" className="block text-xs font-medium text-slate-700 mb-1">
                Existing Conditions (e.g. Asthma, Diabetes, BP)
              </label>
              <input
                id="known-conditions"
                type="text"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Optional: e.g. Hypertension, Asthma"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current-meds" className="block text-xs font-medium text-slate-700 mb-1">
                Current Medications (if any)
              </label>
              <input
                id="current-meds"
                type="text"
                value={currentMeds}
                onChange={(e) => setCurrentMeds(e.target.value)}
                placeholder="Optional: e.g. Metformin 500mg, Inhaler"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="known-allergies" className="block text-xs font-medium text-slate-700 mb-1">
                Known Drug Allergies (if any)
              </label>
              <input
                id="known-allergies"
                type="text"
                value={knownAllergies}
                onChange={(e) => setKnownAllergies(e.target.value)}
                placeholder="Optional: e.g. Penicillin, Sulfa drugs"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            Medisense does not save personal identifying records without consent.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-bold px-7 py-3.5 rounded-xl shadow transition-all hover:shadow-md"
          >
            {loading ? (
              <span>Analyzing against clinical triage rules...</span>
            ) : (
              <>
                <span>Analyze Symptoms Safely</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

