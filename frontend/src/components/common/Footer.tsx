import React from 'react';
import { HeartPulse, ShieldCheck, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <HeartPulse className="w-5 h-5 text-teal-400" />
              <span>Medisense</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              A patient-centered health companion designed to make health information clear, safe, and accessible to ordinary people.
            </p>
            <div className="flex items-center gap-1.5 text-teal-400 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Clinical Safety Guardrails</span>
            </div>
          </div>

          {/* Quick Features */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Core Modules</h4>
            <ul className="space-y-2">
              <li><Link to="/symptom-checker" className="hover:text-teal-300">Smart Symptom Checker</Link></li>
              <li><Link to="/medicines" className="hover:text-teal-300">Medicine Explainer</Link></li>
              <li><Link to="/medications" className="hover:text-teal-300">Medication Reminders</Link></li>
              <li><Link to="/doctor-summary" className="hover:text-teal-300">Doctor Consultation Prep</Link></li>
              <li><Link to="/health-guides" className="hover:text-teal-300">Chronic Disease Precautions</Link></li>
            </ul>
          </div>

          {/* Emergency & Helplines */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Emergency Resources</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <Phone className="w-3.5 h-3.5" />
                <span>India Emergency: 112</span>
              </li>
              <li className="text-slate-400">USA / Canada: 911</li>
              <li className="text-slate-400">UK Emergency: 999</li>
              <li className="text-slate-400">European Union: 112</li>
              <li>
                <a
                  href="https://www.who.int"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-teal-300 mt-1"
                >
                  WHO Health Topics <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Clinical Integrity & Privacy */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Integrity & Safety</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
              Medisense separates verified clinical monographs from AI-generated natural language summaries. AI is prohibited from overriding emergency red flag rules.
            </p>
            <Link to="/settings" className="text-teal-400 hover:text-teal-300 font-medium underline text-xs">
              Review Data Privacy & Reset Local Storage
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Medisense Healthcare Project. Built for education and safe patient communication.</p>
          <p className="text-center sm:text-right text-slate-400">
            Not a licensed physician or medical diagnosis engine. Always seek clinical advice from a doctor.
          </p>
        </div>
      </div>
    </footer>
  );
};

