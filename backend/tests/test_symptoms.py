from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_emergency_triage_chest_pain():
    """Emergency signs must immediately trigger EMERGENCY_CARE."""
    payload = {
        "description": "I have sudden severe crushing chest pain radiating to my left arm and jaw.",
        "severity": 9
    }
    response = client.post("/api/symptoms/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency_level"] == "EMERGENCY_CARE"
    assert data["is_emergency"] is True
    assert "112" in data["emergency_contact"]["india"]
    assert "911" in data["emergency_contact"]["usa"]

def test_emergency_triage_stroke_signs():
    """Slurred speech and facial droop must trigger EMERGENCY_CARE."""
    payload = {
        "description": "My father suddenly developed facial droop and slurred speech.",
        "severity": 8
    }
    response = client.post("/api/symptoms/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency_level"] == "EMERGENCY_CARE"
    assert data["is_emergency"] is True

def test_emergency_infant_fever():
    """Infant fever must trigger pediatric emergency alert."""
    payload = {
        "description": "My 2 month old baby has a high fever and is not feeding well.",
        "age_range": "infant",
        "severity": 7
    }
    response = client.post("/api/symptoms/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency_level"] == "EMERGENCY_CARE"

def test_see_doctor_soon_prolonged_fever():
    """Fever lasting > 3 days triggers SEE_DOCTOR_SOON."""
    payload = {
        "description": "I have had a continuous fever for 4 days and body aches.",
        "severity": 6
    }
    response = client.post("/api/symptoms/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency_level"] == "SEE_DOCTOR_SOON"
    assert data["is_emergency"] is False

def test_mild_headache_home_care():
    """Mild tension-type headache triggers HOME_CARE with supportive advice."""
    payload = {
        "description": "I have a mild headache after a long day of working at my computer.",
        "severity": 3,
        "onset": "this evening",
        "progression": "steady"
    }
    response = client.post("/api/symptoms/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency_level"] == "HOME_CARE"
    assert len(data["possible_conditions"]) > 0
    assert len(data["self_care_measures"]) > 0
    assert len(data["escalation_warning_signs"]) > 0

def test_uncertain_and_missing_info_generates_followup():
    """Missing onset and severity prompts targeted follow-up questions."""
    payload = {
        "description": "Feeling slightly unwell."
    }
    response = client.post("/api/symptoms/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["follow_up_questions"]) > 0

