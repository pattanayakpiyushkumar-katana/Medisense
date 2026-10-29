import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Pill,
  CalendarCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Bell,
  HeartPulse,
  ExternalLink
} from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { todayReminders, adherenceStats, markDose, loading, notificationPermission, requestNotificationPermission } = useMedications();
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    setLoadingHistory(true);
    api.getSymptomHistory()
      .then((data) => setRecentAssessments(data || []))
      .catch(() => setRecentAssessments([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const pendingCount = todayReminders.filter((r) => r.status === 'pending').length;
  const takenCount = todayReminders.filter((r) => r.status === 'taken').length;
  const totalToday = todayReminders.length;
  const progressPercent = totalToday > 0 ? Math.round((takenCount / totalToday) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>{today} • {timeZone}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to Medisense
          </h1>
          <p className="text-teal-100 text-sm max-w-xl leading-relaxed">
            Your personal companion for safe symptom triage, verified medicine guidance, and medication adherence.
          </p>
        </div>

        {/* Quick Emergency Button inside Dashboard */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Link
            to="/symptom-checker"
            className="flex items-center justify-center gap-2 bg-white text-teal-900 hover:bg-teal-50 font-bold px-5 py-3 rounded-xl shadow text-sm transition-all"
          >
            <Activity className="w-4 h-4 text-teal-700" />
            Check Symptoms Now
          </Link>
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-3 rounded-xl shadow text-sm transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency 112
          </a>
        </div>
      </div>

      {/* Main Grid: Reminders + Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Today's Medication Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-teal-700" />
                  Today's Medication Checklist
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled doses for today • {pendingCount} pending
                </p>
              </div>

              <div className="flex items-center gap-2">
                {notificationPermission !== 'granted' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    Enable Alerts
                  </button>
                )}
                <Link
                  to="/medications"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Medicine
                </Link>
              </div>
            </div>

            {/* Daily Progress Bar */}
            {totalToday > 0 && (
              <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                  <span>Today's Completion</span>
                  <span>{progressPercent}% ({takenCount}/{totalToday} doses taken)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checklist Items */}
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  Loading today's medication schedule...
                </div>
              ) : todayReminders.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">No medications scheduled for today</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Add your daily prescriptions to track reminders and adherence.
                    </p>
                  </div>
                  <Link
                    to="/medications"
                    className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Set Up First Medication
                  </Link>
                </div>
              ) : (
                todayReminders.map((dose, idx) => {
                  const isTaken = dose.status === 'taken';
                  const isSkipped = dose.status === 'skipped';
                  const isPending = dose.status === 'pending';

                  return (
                    <div
                      key={`${dose.medication_id}-${dose.scheduled_time}-${idx}`}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border transition-all ${isTaken
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isSkipped
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-teal-300 shadow-sm'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${isTaken
                            ? 'bg-emerald-200 text-emerald-900'
                            : isSkipped
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-teal-100 text-teal-800'
                            }`}
                        >
                          {dose.scheduled_time}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">
                              {dose.medication_name}
                            </span>
                            {dose.dosage && (
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                                {dose.dosage}
                              </span>
                            )}
                          </div>
                          {dose.instructions && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {dose.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 sm:mt-0 flex items-center gap-2 self-end sm:self-center">
                        {isTaken ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            Taken
                          </span>
                        ) : isSkipped ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-200 px-3 py-1.5 rounded-lg">
                            <XCircle className="w-4 h-4" />
                            Skipped
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => markDose(dose.medication_id, dose.scheduled_time, 'taken')}
                              className="flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mark Taken
                            </button>
                            <button
                              onClick={() => markDose(dose.medication_id, dose.scheduled_time, 'skipped')}
                              className="text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Symptom Assessments History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-700" />
                Recent Symptom Checks
              </h2>
              <Link to="/symptom-checker" className="text-xs font-semibold text-teal-700 hover:underline">
                New Assessment
              </Link>
            </div>

            {loadingHistory ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading recent triage history...</p>
            ) : recentAssessments.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                No recent symptom checks recorded. Start a check whenever you feel unwell.
              </div>
            ) : (
              <div className="space-y-3">
                {recentAssessments.slice(0, 3).map((item, i) => {
                  const isEmerg = item.urgency_level === 'EMERGENCY_CARE';
                  const isSoon = item.urgency_level === 'SEE_DOCTOR_SOON';
                  const badgeColor = isEmerg
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : isSoon
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-teal-100 text-teal-800 border-teal-300';

                  return (
                    <div key={item.id || i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          "{item.user_description}"
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {item.summary_text}
                        </p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${badgeColor}`}>
                        {item.urgency_level.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shortcuts, Adherence, and Health Precautions */}
        <div className="space-y-6">
          {/* Adherence Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              Medication Adherence
            </h3>

            {adherenceStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-extrabold text-teal-700">
                      {adherenceStats.adherence_rate_percent}%
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Compliance Rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">
                      {adherenceStats.taken_count} / {adherenceStats.total_scheduled || 1}
                    </p>
                    <p className="text-xs text-slate-500">Doses Logged</p>
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-xs text-teal-900 leading-relaxed">
                  Consistent timing maximizes medication efficacy. Never double-dose to compensate for a missed tablet.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Log doses to view your weekly adherence statistics and habits.
              </p>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900 mb-2">Health Shortcuts</h3>

            <Link
              to="/medicines"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg group-hover:bg-teal-100">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Look Up a Medicine</p>
                  <p className="text-[11px] text-slate-500">Plain-language uses & safety warnings</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
            </Link>

            <Link
              to="/doctor-summary"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg group-hover:bg-teal-100">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Doctor Consultation Prep</p>
                  <p className="text-[11px] text-slate-500">Generate printable visit script</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
            </Link>

            <Link
              to="/health-guides"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg group-hover:bg-teal-100">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Chronic Disease Guides</p>
                  <p className="text-[11px] text-slate-500">Diabetes, BP, Asthma & GERD precautions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
            </Link>
          </div>

          {/* Emergency Safety Box */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>When to Seek Immediate Care</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              If experiencing crushing chest pressure, sudden numbness on one side, severe breathlessness, or persistent vomiting of blood, do not wait.
            </p>
            <a
              href="tel:112"
              className="inline-flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Emergency Helpline: 112 (India)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
