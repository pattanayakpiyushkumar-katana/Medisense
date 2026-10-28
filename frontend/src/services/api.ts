import {
  SymptomAnalysisRequest,
  SymptomAnalysisResponse,
  DoctorSummaryRequest,
  DoctorSummaryResponse,
  MedicineSearchResult,
  MedicineDetail,
  Medication,
  DailyReminderItem,
  AdherenceSummary,
  ConditionPrecaution
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Symptoms & Triage
  analyzeSymptoms: (data: SymptomAnalysisRequest) =>
    request<SymptomAnalysisResponse>('/api/symptoms/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createDoctorSummary: (data: DoctorSummaryRequest) =>
    request<DoctorSummaryResponse>('/api/symptoms/doctor-summary', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSymptomHistory: () =>
    request<any[]>('/api/symptoms/history'),

  // Medicines
  searchMedicines: (query: string) =>
    request<MedicineSearchResult>(`/api/medicines/search?q=${encodeURIComponent(query)}`),

  getMedicineDetail: (id: string) =>
    request<MedicineDetail>(`/api/medicines/${encodeURIComponent(id)}`),

  getAllMedicines: () =>
    request<any[]>('/api/medicines/all'),

  // Medications & Reminders
  getMedications: (activeOnly = true) =>
    request<Medication[]>(`/api/medications?active_only=${activeOnly}`),

  createMedication: (data: Partial<Medication>) =>
    request<Medication>('/api/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMedication: (id: string, data: Partial<Medication>) =>
    request<Medication>(`/api/medications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMedication: (id: string) =>
    request<{ message: string }>(`/api/medications/${id}`, {
      method: 'DELETE',
    }),

  logDoseStatus: (
    medicationId: string,
    scheduledDate: string,
    scheduledTime: string,
    status: 'taken' | 'skipped' | 'pending',
    notes?: string
  ) =>
    request<any>(`/api/medications/${medicationId}/dose-log`, {
      method: 'POST',
      body: JSON.stringify({
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status,
        notes,
      }),
    }),

  getTodayReminders: (targetDate?: string) => {
    const query = targetDate ? `?target_date=${targetDate}` : '';
    return request<DailyReminderItem[]>(`/api/medications/reminders/today${query}`);
  },

  getAdherenceStats: () =>
    request<AdherenceSummary>('/api/medications/adherence/stats'),

  // Health Precautions
  getConditions: () =>
    request<ConditionPrecaution[]>('/api/health/conditions'),

  getConditionDetail: (id: string) =>
    request<ConditionPrecaution>(`/api/health/conditions/${id}`),

  // System Health
  checkHealth: () =>
    request<{ status: string; database: string; mode: string }>('/api/health-check'),
};

