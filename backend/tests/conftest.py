import json
import pytest
from unittest.mock import MagicMock, patch

def generate_mock_gemma_response(json_payload):
    """
    Simulates Gemma 3:4B intelligent responses according to the user input.
    """
    messages = json_payload.get("messages", [])
    user_msg = ""
    for m in messages:
        if m.get("role") == "user":
            user_msg = m.get("content", "")

    user_lower = user_msg.lower()

    # Check if this is a doctor summary request
    if "synthesize this patient intake" in user_lower or "doctor, my primary concern" in user_lower:
        is_empty_history = "prior medical history: none reported" in user_lower
        is_empty_meds = "current medications: none reported" in user_lower
        
        main_concern = "Primary Concern"
        if "main concern:" in user_lower:
            parts = user_msg.split("Main concern:")
            if len(parts) > 1:
                main_concern = parts[1].split("\n")[0].strip()

        data = {
            "patient_speaking_script": f"\"Doctor, my primary concern is {main_concern}. I have noticed symptoms recently. I also noticed mild nausea. Amlodipine 5mg is in my current medications and I have a known allergy to Penicillin.\"",
            "symptoms_and_onset": "Started: 3 days ago. Reported symptoms: headache, fatigue.",
            "duration_and_progression": "Duration: 3 days. Progression: worsening in the afternoon.",
            "severity_reported": "Self-rated severity: 6/10.",
            "associated_symptoms": ["mild nausea"],
            "medical_history_display": "Not provided" if is_empty_history else "Hypertension",
            "current_medications_display": "Not provided" if is_empty_meds else "Amlodipine 5mg",
            "known_allergies_display": "No known drug allergies reported" if is_empty_meds else "Penicillin",
            "questions_for_doctor": [
                f"What do you suspect could be the primary cause of my {main_concern}?",
                "Are there specific diagnostic tests you recommend?"
            ],
            "missing_information": [
                "Prior medical conditions: None provided."
            ] if is_empty_history else []
        }
        return json.dumps(data)

    # Symptom analysis request
    is_mild_headache = "mild headache" in user_lower or "severity rating: 3/10" in user_lower
    is_fever_prolonged = "fever for 4 days" in user_lower or "continuous fever" in user_lower

    if is_mild_headache:
        urgency = "HOME_CARE"
        title = "Home Care and Monitoring (Low-Risk Indicators)"
        expl = "Mild symptoms without red flags appear consistent with tension headache suitable for self-care."
        when_to_seek = "If symptoms do not improve after 3 to 5 days."
    elif is_fever_prolonged:
        urgency = "SEE_DOCTOR_SOON"
        title = "See a Doctor Soon (Within 24-48 Hours)"
        expl = "Fever lasting more than 3 days warrants clinical evaluation to exclude secondary complications."
        when_to_seek = "Within 24 to 48 hours with an urgent care physician."
    else:
        urgency = "HOME_CARE"
        title = "Home Care and Monitoring"
        expl = "Symptoms currently appear suitable for supportive self-care and close monitoring."
        when_to_seek = "If symptoms persist beyond 3 to 5 days."

    data = {
        "urgency_level": urgency,
        "urgency_title": title,
        "urgency_explanation": expl,
        "extracted_symptoms": ["Headache", "Fever", "Tiredness"],
        "possible_conditions": [
            {
                "name": "Tension-Type Headache" if is_mild_headache else "Acute Viral Syndrome",
                "simple_explanation": "A common presentation matching the reported symptoms.",
                "typical_symptoms": ["Headache", "Mild malaise"],
                "matching_symptoms": ["Headache"],
                "missing_information_or_uncertainty": "Detailed vital signs and physical examination required.",
                "professional_evaluation_needed": not is_mild_headache
            }
        ],
        "diagnostic_suggestions": [
            {
                "category": "Basic Clinical Assessment",
                "examples": ["Complete Blood Count (CBC)", "Vital signs check"],
                "why_clinician_considers": "To assess overall physical state.",
                "important_note": "Diagnostic tests are ordered based on physician evaluation."
            }
        ],
        "self_care_measures": [
            "Stay well hydrated with plenty of fluids.",
            "Rest in a quiet, dark, well-ventilated room."
        ],
        "when_to_seek_care": when_to_seek,
        "escalation_warning_signs": [
            "Sudden explosive thunderclap headache",
            "High fever with stiff neck or confusion"
        ],
        "follow_up_questions": [
            "Approximately how many days or hours ago did these symptoms begin?"
        ]
    }
    return json.dumps(data)

@pytest.fixture(autouse=True)
def mock_ollama_default(request):
    """
    Autouse fixture that provides dynamic realistic mock responses for Ollama /api/chat.
    Allows all automated tests to execute offline without requiring Ollama daemon or model pull.
    Specific tests in test_ollama_service.py can still patch requests.post to test failure modes.
    """
    if any(k in request.node.name for k in ["offline", "connection_error", "timeout", "not_found", "malformed", "empty"]):
        yield
        return

    def fake_post(url, **kwargs):
        payload = kwargs.get("json", {})
        resp_content = generate_mock_gemma_response(payload)
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "model": "gemma3:4b",
            "message": {
                "role": "assistant",
                "content": resp_content
            }
        }
        return mock_resp

    with patch("requests.post", side_effect=fake_post):
        yield
