import uuid
from typing import List, Optional
from ..schemas.doctor_summary import DoctorSummaryRequest, DoctorSummaryResponse

def generate_doctor_summary(req: DoctorSummaryRequest) -> DoctorSummaryResponse:
    # Build natural language patient speaking script
    concern = req.main_concern.strip()
    onset_str = req.onset.strip() if req.onset else "an unspecified time recently"
    prog_str = req.progression.strip() if req.progression else "fluctuating"
    sev_str = f"{req.severity}/10" if req.severity else "mild to moderate"
    
    symptoms_text = ", ".join(req.symptoms) if req.symptoms else concern
    assoc_text = ", ".join(req.associated_symptoms) if req.associated_symptoms else "none noted"

    script = (
        f"\"Doctor, my primary concern is {concern}. "
        f"I have been noticing {symptoms_text}. "
        f"These symptoms started around {onset_str} and have been {prog_str}. "
        f"On a scale of 1 to 10, the discomfort feels around {sev_str}. "
        f"I also noticed {assoc_text}. "
        f"I would appreciate your assessment on what might be causing this and whether any tests or examinations are recommended.\""
    )

    # Compile questions for doctor
    questions = list(req.user_questions or [])
    if not questions:
        questions = [
            f"What do you suspect could be the primary cause of my {concern}?",
            "Are there specific diagnostic tests or exams you recommend at this stage?",
            "What warning signs should prompt me to seek urgent care before our next follow-up?",
            "Are there any activities or foods I should temporarily avoid while recovering?"
        ]

    # Explicitly track missing information
    missing = []
    if not req.onset:
        missing.append("Exact onset date/time was not provided.")
    if not req.progression:
        missing.append("Symptom progression (improving vs worsening) was not specified.")
    if req.severity is None:
        missing.append("Pain/severity rating (1-10) was not specified.")
    if not req.medical_history:
        missing.append("Prior medical conditions: None provided.")
    if not req.current_medications:
        missing.append("Current medications: None provided.")
    if not req.known_allergies:
        missing.append("Known allergies: None provided.")

    return DoctorSummaryResponse(
        id=str(uuid.uuid4()),
        main_concern=concern,
        patient_speaking_script=script,
        symptoms_and_onset=f"Started: {onset_str}. Reported symptoms: {symptoms_text}.",
        duration_and_progression=f"Duration/Progression: {prog_str}.",
        severity_reported=f"Self-rated severity: {sev_str}.",
        associated_symptoms=req.associated_symptoms or ["None reported"],
        medical_history_display=", ".join(req.medical_history) if req.medical_history else "Not provided",
        current_medications_display=", ".join(req.current_medications) if req.current_medications else "Not provided",
        known_allergies_display=", ".join(req.known_allergies) if req.known_allergies else "No known drug allergies reported",
        questions_for_doctor=questions,
        missing_information=missing
    )

