import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Pill,
  CalendarCheck,
  FileText,
  BookOpen,
  Settings,
  Menu,
  X,
  HeartPulse,
  LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/symptom-checker', label: 'Symptom Checker', icon: Activity },
    { to: '/medicines', label: 'Medicine Explainer', icon: Pill },
    { to: '/medications', label: 'Reminders & Schedule', icon: CalendarCheck },
    { to: '/doctor-summary', label: 'Doctor Summary', icon: FileText },
    { to: '/health-guides', label: 'Health Guides', icon: BookOpen },
    { to: '/settings', label: 'Privacy & Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Medisense
                  <span className="text-[10px] font-semibold tracking-wider bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200 uppercase">
                    Health AI
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Understand Your Health. Make Informed Decisions.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action: Emergency Button & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              to="/symptom-checker"
              className="hidden sm:flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              Check Symptoms
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${active
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

