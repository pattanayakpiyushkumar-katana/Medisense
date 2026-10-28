export type UrgencyLevel =
  | 'EMERGENCY_CARE'
  | 'SEE_DOCTOR_SOON'
  | 'ROUTINE_APPOINTMENT'
  | 'HOME_CARE';

export interface PossibleCondition {
  name: string;
  simple_explanation: string;
  typical_symptoms: string[];
  matching_symptoms: string[];
  missing_information_or_uncertainty: string;
  professional_evaluation_needed: boolean;
}

export interface DiagnosticSuggestion {
  category: string;
  examples: string[];
  why_clinician_considers: string;
  important_note: string;
}

export interface SymptomAnalysisResponse {
  urgency_level: UrgencyLevel;
  urgency_title: string;
  urgency_explanation: string;
  is_emergency: boolean;
  emergency_contact: {
    india: string;
    usa: string;
    uk: string;
    general: string;
  };
  extracted_symptoms: string[];
  possible_conditions: PossibleCondition[];
  diagnostic_suggestions: DiagnosticSuggestion[];
  self_care_measures: string[];
  when_to_seek_care: string;
  escalation_warning_signs: string[];
  follow_up_questions: string[];
  evaluation_engine: string;
  clinical_disclaimer: string;
}

export interface SymptomAnalysisRequest {
  description: string;
  selected_symptoms?: string[];
  onset?: string;
  severity?: number;
  progression?: string;
  age_range?: string;
  medical_history?: string[];
  current_medications?: string[];
  known_allergies?: string[];
  associated_symptoms?: string[];
  follow_up_answers?: Record<string, string>;
}

export interface DoctorSummaryRequest {
  main_concern: string;
  symptoms: string[];
  onset?: string;
  duration?: string;
  progression?: string;
  severity?: number;
  associated_symptoms?: string[];
  medical_history?: string[];
  current_medications?: string[];
  known_allergies?: string[];
  user_questions?: string[];
  notes?: string;
}

export interface DoctorSummaryResponse {
  id?: string;
  main_concern: string;
  patient_speaking_script: string;
  symptoms_and_onset: string;
  duration_and_progression: string;
  severity_reported: string;
  associated_symptoms: string[];
  medical_history_display: string;
  current_medications_display: string;
  known_allergies_display: string;
  questions_for_doctor: string[];
  missing_information: string[];
  disclaimer: string;
}

export interface MedicineSearchItem {
  id: string;
  name: string;
  active_ingredient: string;
  brand_names: string[];
  category: string;
  strengths_common: string[];
}

export interface MedicineDetail {
  id: string;
  name: string;
  active_ingredient: string;
  brand_names: string[];
  category: string;
  strengths_common: string[];
  common_uses: string[];
  how_it_works_simple: string;
  common_side_effects: string[];
  serious_warning_signs: string[];
  important_precautions: string[];
  contraindications_and_interactions: string[];
  food_instructions: string;
  storage_info: string;
  special_considerations: Record<string, string>;
  questions_to_ask_doctor: string[];
  sources: string[];
  last_checked_date: string;
  safety_notice: string;
}

export interface AmbiguityGuidance {
  is_ambiguous: boolean;
  query: string;
  explanation: string;
  prompt_for_user: string;
  suggested_matches: MedicineSearchItem[];
}

export interface MedicineSearchResult {
  is_ambiguous: boolean;
  guidance: AmbiguityGuidance | null;
  results: MedicineSearchItem[];
}

export interface DoseLog {
  id: string;
  medication_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'taken' | 'skipped' | 'pending';
  action_timestamp: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  instructions?: string;
  frequency_type: string;
  reminder_times: string[];
  days_of_week: string[];
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  dose_logs?: DoseLog[];
}

export interface DailyReminderItem {
  medication_id: string;
  medication_name: string;
  dosage?: string;
  instructions?: string;
  scheduled_time: string;
  scheduled_date: string;
  status: 'taken' | 'skipped' | 'pending';
  dose_log_id?: string;
}

export interface AdherenceSummary {
  total_scheduled: number;
  taken_count: number;
  skipped_count: number;
  pending_count: number;
  adherence_rate_percent: number;
  streak_days: number;
}

export interface ConditionPrecaution {
  id: string;
  name: string;
  category: string;
  overview: string;
  general_precautions: string[];
  warning_signs: string[];
  lifestyle_considerations: string[];
  medication_cautions: string[];
  when_to_seek_care: string;
  questions_to_ask_doctor: string[];
}
