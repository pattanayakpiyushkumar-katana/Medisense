from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_doctor_consultation_summary():
    payload = {
        "main_concern": "Persistent tension headache and tiredness",
        "symptoms": ["headache", "fatigue", "neck tightness"],
        "onset": "3 days ago",
        "progression": "worsening in the afternoon",
        "severity": 6,
        "associated_symptoms": ["mild nausea"],
        "medical_history": ["Hypertension"],
        "current_medications": ["Amlodipine 5mg"],
        "known_allergies": ["Penicillin"]
    }
    response = client.post("/api/symptoms/doctor-summary", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Doctor, my primary concern is Persistent tension headache" in data["patient_speaking_script"]
    assert "3 days ago" in data["symptoms_and_onset"]
    assert "Amlodipine 5mg" in data["current_medications_display"]
    assert "Penicillin" in data["known_allergies_display"]
    assert len(data["questions_for_doctor"]) > 0

def test_missing_info_marked_accurately():
    payload = {
        "main_concern": "Mild cough"
    }
    response = client.post("/api/symptoms/doctor-summary", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["medical_history_display"] == "Not provided"
    assert data["current_medications_display"] == "Not provided"
    assert len(data["missing_information"]) > 0

