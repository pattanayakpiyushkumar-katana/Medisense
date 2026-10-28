from typing import List, Optional, Dict
from enum import Enum
from pydantic import BaseModel, Field

class UrgencyLevel(str, Enum):
    EMERGENCY_CARE = "EMERGENCY_CARE"
    SEE_DOCTOR_SOON = "SEE_DOCTOR_SOON"
    ROUTINE_APPOINTMENT = "ROUTINE_APPOINTMENT"
    HOME_CARE = "HOME_CARE"

class SymptomAnalysisRequest(BaseModel):
    description: str = Field(..., min_length=3, description="Free text user symptom description")
    selected_symptoms: Optional[List[str]] = Field(default_factory=list)
    onset: Optional[str] = Field(None, description="When symptoms started e.g. 'yesterday'")
    severity: Optional[int] = Field(None, ge=1, le=10, description="Self-reported severity scale 1 to 10")
    progression: Optional[str] = Field(None, description="worsening, improving, steady, fluctuating")
    age_range: Optional[str] = Field(None, description="e.g. infant (<1 yr), child (1-12), adult (18-64), older adult (65+)")
    medical_history: Optional[List[str]] = Field(default_factory=list)
    current_medications: Optional[List[str]] = Field(default_factory=list)
    known_allergies: Optional[List[str]] = Field(default_factory=list)
    associated_symptoms: Optional[List[str]] = Field(default_factory=list)
    follow_up_answers: Optional[Dict[str, str]] = Field(default_factory=dict)

class PossibleCondition(BaseModel):
    name: str
    simple_explanation: str
    typical_symptoms: List[str]
    matching_symptoms: List[str]
    missing_information_or_uncertainty: str
    professional_evaluation_needed: bool

class DiagnosticSuggestion(BaseModel):
    category: str
    examples: List[str]
    why_clinician_considers: str
    important_note: str

class SymptomAnalysisResponse(BaseModel):
    urgency_level: UrgencyLevel
    urgency_title: str
    urgency_explanation: str
    is_emergency: bool
    emergency_contact: Dict[str, str] = Field(
        default_factory=lambda: {
            "india": "112",
            "usa": "911",
            "uk": "999",
            "general": "Call local emergency services or visit the nearest emergency department immediately."
        }
    )
    extracted_symptoms: List[str]
    possible_conditions: List[PossibleCondition]
    diagnostic_suggestions: List[DiagnosticSuggestion]
    self_care_measures: List[str]
    when_to_seek_care: str
    escalation_warning_signs: List[str]
    follow_up_questions: List[str]
    evaluation_engine: str
    clinical_disclaimer: str = (
        "Educational guidance only. Not a medical diagnosis. "
        "Medisense does not replace professional medical assessment. "
        "If in doubt or symptoms worsen, seek evaluation from a qualified healthcare practitioner."
    )

