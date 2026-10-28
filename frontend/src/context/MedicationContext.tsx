import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medication, DailyReminderItem, AdherenceSummary } from '../types';
import { api } from '../services/api';
import { notificationHelper } from '../utils/notificationHelper';

interface MedicationContextType {
  medications: Medication[];
  todayReminders: DailyReminderItem[];
  adherenceStats: AdherenceSummary | null;
  loading: boolean;
  error: string | null;
  notificationPermission: NotificationPermission;
  refreshData: () => Promise<void>;
  addMedication: (data: Partial<Medication>) => Promise<Medication>;
  updateMedication: (id: string, data: Partial<Medication>) => Promise<Medication>;
  deleteMedication: (id: string) => Promise<void>;
  markDose: (medicationId: string, scheduledTime: string, status: 'taken' | 'skipped') => Promise<void>;
  requestNotificationPermission: () => Promise<void>;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const MedicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayReminders, setTodayReminders] = useState<DailyReminderItem[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<AdherenceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    notificationHelper.getPermission()
  );

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [medsData, remindersData, statsData] = await Promise.all([
        api.getMedications(),
        api.getTodayReminders(),
        api.getAdherenceStats().catch(() => null),
      ]);
      setMedications(medsData);
      setTodayReminders(remindersData);
      setAdherenceStats(statsData);
    } catch (err: any) {
      console.error('Error refreshing medications data:', err);
      setError('Could not load medication records from server. Working in local demo mode.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Check every 60 seconds if any dose is scheduled for right now
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const pendingDose = todayReminders.find(
        (r) => r.scheduled_time === currentTimeStr && r.status === 'pending'
      );

      if (pendingDose) {
        notificationHelper.sendNotification(`Medication Reminder: ${pendingDose.medication_name}`, {
          body: `Time to take your scheduled dose: ${pendingDose.medication_name} (${pendingDose.dosage || 'prescribed amount'}). Instructions: ${pendingDose.instructions || 'As labeled'}.`,
        });
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [todayReminders]);

  const requestNotificationPermission = async () => {
    const perm = await notificationHelper.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      notificationHelper.sendNotification('Medisense Notifications Activated', {
        body: 'You will receive reminders for your scheduled doses when this application is open.',
      });
    }
  };

  const addMedication = async (data: Partial<Medication>): Promise<Medication> => {
    const created = await api.createMedication(data);
    await refreshData();
    return created;
  };

  const updateMedication = async (id: string, data: Partial<Medication>): Promise<Medication> => {
    const updated = await api.updateMedication(id, data);
    await refreshData();
    return updated;
  };

  const deleteMedication = async (id: string): Promise<void> => {
    await api.deleteMedication(id);
    await refreshData();
  };

  const markDose = async (medicationId: string, scheduledTime: string, status: 'taken' | 'skipped') => {
    const todayStr = new Date().toISOString().split('T')[0];
    await api.logDoseStatus(medicationId, todayStr, scheduledTime, status);
    await refreshData();
  };

  return (
    <MedicationContext.Provider
      value={{
        medications,
        todayReminders,
        adherenceStats,
        loading,
        error,
        notificationPermission,
        refreshData,
        addMedication,
        updateMedication,
        deleteMedication,
        markDose,
        requestNotificationPermission,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedications = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedications must be used within a MedicationProvider');
  }
  return context;
};

