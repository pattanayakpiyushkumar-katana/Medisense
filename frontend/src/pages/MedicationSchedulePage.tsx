import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit2,
  Bell,
  ShieldAlert,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import { Medication } from '../types';
import { Toast } from '../components/common/Toast';
import { notificationHelper } from '../utils/notificationHelper';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MedicationSchedulePage: React.FC = () => {
  const {
    medications,
    todayReminders,
    adherenceStats,
    loading,
    addMedication,
    deleteMedication,
    markDose,
    notificationPermission,
    requestNotificationPermission
  } = useMedications();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New medication form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS_OF_WEEK);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const reminderTimes = [time1];
    if (time2.trim()) reminderTimes.push(time2.trim());

    try {
      await addMedication({
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        instructions: instructions.trim() || undefined,
        frequency_type: selectedDays.length === 7 ? 'daily' : 'custom',
        reminder_times: reminderTimes,
        days_of_week: selectedDays,
        start_date: startDate,
        end_date: endDate.trim() || undefined,
        is_active: true,
      });

      setToastMessage(`Added ${name} to your daily schedule!`);
      setIsModalOpen(false);
      setName('');
      setDosage('');
      setInstructions('');
      setTime1('08:00');
      setTime2('');
    } catch (err: any) {
      console.error(err);
      setToastMessage('Error adding medication. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, medName: string) => {
    if (window.confirm(`Are you sure you want to remove ${medName} from your schedule?`)) {
      try {
        await deleteMedication(id);
        setToastMessage(`Removed ${medName}`);
      } catch (e) {
        setToastMessage('Failed to remove medication');
      }
    }
  };

  const handleTestNotification = () => {
    const success = notificationHelper.sendNotification('Medisense Reminder Test', {
      body: 'Notifications are functioning properly! You will receive scheduled reminders.',
    });
    if (!success) {
      setToastMessage('Please grant notification permission first.');
    } else {
      setToastMessage('Test notification sent!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Schedule & Reminders
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Medication Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize your prescriptions, track completed doses, and stay consistent with your treatments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={requestNotificationPermission}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              Enable Reminders
            </button>
          ) : (
            <button
              onClick={handleTestNotification}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 bg-white border border-slate-200 px-3 py-2 rounded-xl"
            >
              <Bell className="w-3.5 h-3.5 text-teal-600" />
              Test Alert
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        </div>
      </div>

      {/* Grid: Left Column Today's Checklist, Right Column Managed Meds & Adherence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-teal-700" />
                Today's Dose Checklist
              </h2>
              <span className="text-xs font-mono text-slate-500">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {loading ? (
              <p className="py-8 text-center text-slate-400 text-xs">Loading doses...</p>
            ) : todayReminders.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                <Clock className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No doses scheduled for today</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click 'Add Medication' to configure your daily prescriptions or vitamins.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayReminders.map((dose, idx) => {
                  const isTaken = dose.status === 'taken';
                  const isSkipped = dose.status === 'skipped';

                  return (
                    <div
                      key={`${dose.medication_id}-${dose.scheduled_time}-${idx}`}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isTaken
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : isSkipped
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono text-sm font-bold ${
                            isTaken
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
                            <span className="font-bold text-slate-900 text-base">
                              {dose.medication_name}
                            </span>
                            {dose.dosage && (
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
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

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isTaken ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        ) : isSkipped ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-200 px-3 py-1.5 rounded-xl">
                            <XCircle className="w-4 h-4" />
                            Skipped
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                markDose(dose.medication_id, dose.scheduled_time, 'taken');
                                setToastMessage(`Marked ${dose.medication_name} as taken!`);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-sm transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Taken
                            </button>
                            <button
                              onClick={() => {
                                markDose(dose.medication_id, dose.scheduled_time, 'skipped');
                                setToastMessage(`Skipped dose for ${dose.medication_name}`);
                              }}
                              className="text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors"
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Safe Missed Dose Policy Card (Strict Safety Rule from Prompt) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>What Should I Do If I Miss a Dose?</span>
            </div>
            <p className="leading-relaxed">
              <strong>Never take a double dose to make up for a missed tablet.</strong> In general, take the missed dose as soon as you remember, unless it is almost time for your next scheduled dose. Always refer to your specific product leaflet or phone your pharmacist for guidance.
            </p>
          </div>
        </div>

        {/* Right Column: Active Medications Catalog & Notification Limitations */}
        <div className="space-y-6">
          {/* Adherence Overview */}
          {adherenceStats && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Adherence Summary
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-extrabold text-teal-700">
                    {adherenceStats.adherence_rate_percent}%
                  </p>
                  <p className="text-xs text-slate-500">Overall Tracked Adherence</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-800">
                    {adherenceStats.taken_count} Doses
                  </p>
                  <p className="text-xs text-slate-500">Successfully Recorded</p>
                </div>
              </div>
            </div>
          )}

          {/* Active Medication List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>Configured Medications ({medications.length})</span>
            </h3>

            {medications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No active medications in your schedule.
              </p>
            ) : (
              <div className="space-y-3">
                {medications.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">{m.name}</span>
                        {m.dosage && (
                          <span className="text-[11px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {m.dosage}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {m.reminder_times.join(', ')} • {m.days_of_week.length === 7 ? 'Daily' : m.days_of_week.join(', ')}
                      </p>
                      {m.instructions && (
                        <p className="text-[11px] text-teal-800 mt-1 line-clamp-1 italic">
                          "{m.instructions}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Browser Notification Limitations Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Info className="w-4 h-4 text-teal-700" />
              <span>Notification Technical Note</span>
            </div>
            <p className="leading-relaxed">
              {notificationHelper.limitationsNote}
            </p>
          </div>
        </div>
      </div>

      {/* Add Medication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-teal-700" />
                Add Medication to Schedule
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMedication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Metformin, Amlodipine, Calpol"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Strength / Dosage (Optional)
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500 mg, 1 tablet, 5 ml"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructions from Prescription or Box
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take 1 tablet after breakfast with water"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    First Reminder Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={time1}
                    onChange={(e) => setTime1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Second Reminder (Optional)
                  </label>
                  <input
                    type="time"
                    value={time2}
                    onChange={(e) => setTime2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Days of the Week
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const active = selectedDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                          active
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white rounded-xl shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

