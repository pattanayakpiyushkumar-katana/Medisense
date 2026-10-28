import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  AlertTriangle,
  ShieldCheck,
  Info,
  Calendar,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { MedicineDetail, MedicineSearchItem, AmbiguityGuidance } from '../types';

const POPULAR_MEDICINES = [
  'Paracetamol (Dolo 650)',
  'Ibuprofen (Brufen)',
  'Metformin (Glycomet)',
  'Amlodipine (Amlong)',
  'Cetirizine (Cetzine)',
  'Omeprazole (Omez)',
  'Oral Rehydration Salts (Electral)',
  'Salbutamol (Asthalin)'
];

export const MedicineExplainerPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineSearchItem[]>([]);
  const [ambiguityGuidance, setAmbiguityGuidance] = useState<AmbiguityGuidance | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load default medicine on start (Paracetamol)
  useEffect(() => {
    loadMedicineDetail('paracetamol');
  }, []);

  const loadMedicineDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMedicineDetail(id);
      setSelectedMedicine(data);
      setAmbiguityGuidance(null);
      setSearchResults([]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not load medicine details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const res = await api.searchMedicines(query);
      if (res.is_ambiguous && res.guidance) {
        setAmbiguityGuidance(res.guidance);
        setSearchResults([]);
      } else {
        setAmbiguityGuidance(null);
        setSearchResults(res.results);
        if (res.results.length === 1) {
          loadMedicineDetail(res.results[0].id);
        } else if (res.results.length === 0) {
          setError(`No verified medicine matched "${query}". Try searching by generic active ingredient or brand name.`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectQuickChip = (term: string) => {
    const rawName = term.split(' ')[0].toLowerCase();
    setQuery(rawName);
    loadMedicineDetail(rawName);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Page Header */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Evidence-Based Clinical Drug Reference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Medicine Explainer
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Learn about your medications in simple, human language. Sourced from official pharmaceutical compendiums with zero fabricated dosing.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand name, generic, or active ingredient (e.g. Dolo 650, Ibuprofen, Metformin 500mg)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 placeholder-slate-400 shadow-sm"
          />
          <button
            type="submit"
            disabled={searching}
            className="absolute right-2 top-2 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Popular Medicines Shortcuts */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Common Medications
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_MEDICINES.map((item) => (
            <button
              key={item}
              onClick={() => handleSelectQuickChip(item)}
              className="text-xs bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              {item}
            </button>
          ))}
          {/* Ambiguity demo button */}
          <button
            onClick={() => {
              setQuery('painkiller');
              api.searchMedicines('painkiller').then((res) => {
                if (res.guidance) setAmbiguityGuidance(res.guidance);
              });
            }}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            ⚠️ Test Ambiguous Query ("painkiller")
          </button>
        </div>
      </div>

      {/* Ambiguity Alert Card (Feature Four Safety Requirement) */}
      {ambiguityGuidance && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm space-y-3 animate-in fade-in-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-600 text-white rounded-xl flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-amber-900">
                Ambiguous Term: "{ambiguityGuidance.query}"
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                {ambiguityGuidance.explanation}
              </p>
              <p className="text-xs text-amber-950 font-bold pt-1">
                👉 {ambiguityGuidance.prompt_for_user}
              </p>
            </div>
          </div>

          {ambiguityGuidance.suggested_matches.length > 0 && (
            <div className="pt-3 border-t border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900">
                Did you mean one of these specific medications?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ambiguityGuidance.suggested_matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => loadMedicineDetail(match.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-200 hover:border-teal-500 hover:bg-teal-50 text-left text-xs transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{match.name}</p>
                      <p className="text-[11px] text-slate-500">{match.active_ingredient}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results Dropdown/List if multiple matches */}
      {searchResults.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Matching Medications ({searchResults.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {searchResults.map((m) => (
              <button
                key={m.id}
                onClick={() => loadMedicineDetail(m.id)}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/60 text-left transition-colors"
              >
                <div>
                  <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.active_ingredient}</p>
                  <div className="flex gap-1 mt-1">
                    {m.brand_names.slice(0, 2).map((b) => (
                      <span key={b} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Detailed Medicine Card View */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading verified pharmaceutical monograph...
        </div>
      ) : selectedMedicine && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 animate-in fade-in-50">
          {/* Header Info */}
          <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedMedicine.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Verified Reference
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedMedicine.name}
              </h2>
              <p className="text-sm font-semibold text-teal-800 mt-1">
                Active Ingredient: {selectedMedicine.active_ingredient}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs text-slate-500 block">Common Strengths:</span>
              <div className="flex sm:justify-end gap-1.5 flex-wrap">
                {selectedMedicine.strengths_common.map((str) => (
                  <span key={str} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono font-medium">
                    {str}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Common Brand Names */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Popular Brand Names in India & Globally:
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedMedicine.brand_names.map((b) => (
                <span key={b} className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200 font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Section 1 & 2: Uses & How It Works */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                What It Is Commonly Used For
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                {selectedMedicine.common_uses.map((u, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
              <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                How It Works in Simple Language
              </h3>
              <p className="text-xs text-teal-900 leading-relaxed">
                {selectedMedicine.how_it_works_simple}
              </p>
            </div>
          </div>

          {/* Section 3 & 4: Side Effects & Warning Signs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                Common Side Effects (Usually Mild)
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                {selectedMedicine.common_side_effects.map((se, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>{se}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Serious Warning Signs (Seek Medical Attention)
              </h3>
              <ul className="space-y-1.5 text-xs text-rose-950 leading-relaxed font-medium">
                {selectedMedicine.serious_warning_signs.map((ws, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">!</span>
                    <span>{ws}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 5: Precautions & Food Instructions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Important Precautions & Food Instructions
            </h3>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="space-y-1 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">Food & Administration:</span>
                <p className="text-slate-600">{selectedMedicine.food_instructions}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">Critical Precautions:</span>
                <ul className="space-y-1 text-slate-600">
                  {selectedMedicine.important_precautions.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-700 font-bold">→</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">Contraindications & Drug Interactions:</span>
                <ul className="space-y-1 text-slate-600">
                  {selectedMedicine.contraindications_and_interactions.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">✕</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 6: Special Considerations & Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Special Populations
              </h4>
              <div className="space-y-1.5 text-slate-600">
                {Object.entries(selectedMedicine.special_considerations).map(([key, val]) => (
                  <p key={key}>
                    <strong className="capitalize text-slate-800">{key.replace(/_/g, ' ')}: </strong>
                    {val}
                  </p>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Storage & Questions to Ask
              </h4>
              <p className="text-slate-600 mb-2">
                <strong className="text-slate-800">Storage: </strong>{selectedMedicine.storage_info}
              </p>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                <strong className="text-slate-800 block">Questions for Doctor / Pharmacist:</strong>
                {selectedMedicine.questions_to_ask_doctor.map((q, idx) => (
                  <p key={idx}>• {q}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Timing & Dosage Policy Disclaimer (Strict Safety Feature) */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Timing & Dosage Safety Notice</span>
            </div>
            <p className="leading-relaxed">
              Medisense presents general administration guidelines only. Individualized dosing depends on your renal function, body weight, and clinical indication. Never start, discontinue, increase, decrease, or substitute prescription medications without consulting your prescribing physician or pharmacist.
            </p>
          </div>

          {/* References & Last Checked */}
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-400">
            <div>
              <strong>Verified Sources: </strong>
              <span>{selectedMedicine.sources.join(' • ')}</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last Checked: {selectedMedicine.last_checked_date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
