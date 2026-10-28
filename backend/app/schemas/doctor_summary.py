from typing import List, Optional
from pydantic import BaseModel, Field

class DoctorSummaryRequest(BaseModel):
    main_concern: str = Field(..., min_length=2)
    symptoms: List[str] = Field(default_factory=list)
    onset: Optional[str] = None
    duration: Optional[str] = None
    progression: Optional[str] = None
    severity: Optional[int] = Field(None, ge=1, le=10)
    associated_symptoms: Optional[List[str]] = Field(default_factory=list)
    medical_history: Optional[List[str]] = Field(default_factory=list)
    current_medications: Optional[List[str]] = Field(default_factory=list)
    known_allergies: Optional[List[str]] = Field(default_factory=list)
    user_questions: Optional[List[str]] = Field(default_factory=list)
    notes: Optional[str] = None

class DoctorSummaryResponse(BaseModel):
    id: Optional[str] = None
    main_concern: str
    patient_speaking_script: str
    symptoms_and_onset: str
    duration_and_progression: str
    severity_reported: str
    associated_symptoms: List[str]
    medical_history_display: str
    current_medications_display: str
    known_allergies_display: str
    questions_for_doctor: List[str]
    missing_information: List[str]
    disclaimer: str = (
        "This summary is prepared for your doctor consultation based solely on information you reported. "
        "It is not a clinical referral letter or medical diagnosis."
    )

