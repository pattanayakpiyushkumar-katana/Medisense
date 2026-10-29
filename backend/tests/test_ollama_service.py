import json
import pytest
from unittest.mock import patch, MagicMock
import requests
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.schemas.symptom import SymptomAnalysisRequest, UrgencyLevel
from app.schemas.doctor_summary import DoctorSummaryRequest
from app.services.ollama_service import (
    OllamaClient,
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaTimeoutError,
    OllamaResponseError,
    OllamaServiceError,
    extract_and_parse_json,
    analyze_symptoms_with_gemma,
    generate_doctor_summary_with_gemma
)

client = TestClient(app)

# ==============================================================================
# 1. JSON Extraction & Cleaning Unit Tests
# ==============================================================================
def test_extract_and_parse_clean_json():
    raw = '{"key": "value", "count": 42}'
    result = extract_and_parse_json(raw)
    assert result == {"key": "value", "count": 42}

def test_extract_and_parse_markdown_fenced_json():
    raw = '```json\n{"urgency_level": "HOME_CARE", "title": "Mild Discomfort"}\n```'
    result = extract_and_parse_json(raw)
    assert result["urgency_level"] == "HOME_CARE"
    assert result["title"] == "Mild Discomfort"

def test_extract_and_parse_json_with_surrounding_prose():
    raw = 'Here is the clinical evaluation:\n\n{"urgency_level": "SEE_DOCTOR_SOON"}\n\nHope this helps!'
    result = extract_and_parse_json(raw)
    assert result["urgency_level"] == "SEE_DOCTOR_SOON"

def test_extract_and_parse_empty_string_raises():
    with pytest.raises(OllamaResponseError):
        extract_and_parse_json("")

def test_extract_and_parse_malformed_string_raises():
    with pytest.raises(OllamaResponseError):
        extract_and_parse_json("This is not JSON at all.")


# ==============================================================================
# 2. Ollama Client Adapter Error Handling Tests
# ==============================================================================
def test_ollama_connection_error():
    """Simulates offline Ollama daemon and ensures clear user instructions."""
    ollama = OllamaClient(base_url="http://localhost:11434", model="gemma3:4b")
    with patch("requests.post", side_effect=requests.exceptions.ConnectionError("Connection refused")):
        with pytest.raises(OllamaConnectionError) as exc_info:
            ollama.chat([{"role": "user", "content": "hi"}])
        assert "Unable to connect to Ollama at http://localhost:11434" in str(exc_info.value)
        assert "ollama serve" in str(exc_info.value)

def test_ollama_model_not_found_error():
    """Simulates 404 from Ollama when gemma3:4b has not been pulled."""
    ollama = OllamaClient(base_url="http://localhost:11434", model="gemma3:4b")
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    mock_resp.text = '{"error": "model \'gemma3:4b\' not found, try pulling it first"}'
    with patch("requests.post", return_value=mock_resp):
        with pytest.raises(OllamaModelNotFoundError) as exc_info:
            ollama.chat([{"role": "user", "content": "hi"}])
        assert "Model 'gemma3:4b' is not installed in Ollama" in str(exc_info.value)
        assert "ollama pull gemma3:4b" in str(exc_info.value)

def test_ollama_timeout_error():
    """Simulates inference timeout."""
    ollama = OllamaClient(base_url="http://localhost:11434", model="gemma3:4b", timeout=5.0)
    with patch("requests.post", side_effect=requests.exceptions.Timeout("Request timed out")):
        with pytest.raises(OllamaTimeoutError) as exc_info:
            ollama.chat([{"role": "user", "content": "hi"}])
        assert "timed out after 5.0s" in str(exc_info.value)
        assert "Gemma 3:4B" in str(exc_info.value)

def test_ollama_empty_message_error():
    """Simulates empty content message from model."""
    ollama = OllamaClient(base_url="http://localhost:11434", model="gemma3:4b")
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"message": {"content": ""}}
    with patch("requests.post", return_value=mock_resp):
        with pytest.raises(OllamaResponseError) as exc_info:
            ollama.chat([{"role": "user", "content": "hi"}])
        assert "returned an empty message" in str(exc_info.value)


# ==============================================================================
# 3. Gemma 3:4B Symptom Assessment Structured Output Tests
# ==============================================================================
SAMPLE_GEMMA_SYMPTOM_JSON = json.dumps({
    "urgency_level": "SEE_DOCTOR_SOON",
    "urgency_title": "Doctor Evaluation Advised",
    "urgency_explanation": "Fever persisting for 4 days requires medical examination to rule out secondary bacterial infection.",
    "extracted_symptoms": ["Persistent fever", "Body aches"],
    "possible_conditions": [
        {
            "name": "Viral Syndrome vs Secondary Bacterial Infection",
            "simple_explanation": "A common systemic infection that may require examination if fever is prolonged.",
            "typical_symptoms": ["Elevated temperature", "Generalized myalgia"],
            "matching_symptoms": ["Persistent fever", "Body aches"],
            "missing_information_or_uncertainty": "Exact temperature readings, complete blood count.",
            "professional_evaluation_needed": True
        }
    ],
    "diagnostic_suggestions": [
        {
            "category": "Basic Diagnostic Workup",
            "examples": ["Complete Blood Count (CBC)", "Clinical auscultation"],
            "why_clinician_considers": "To evaluate infection markers.",
            "important_note": "Laboratory decisions are made by your physician."
        }
    ],
    "self_care_measures": [
        "Maintain adequate oral hydration with water and electrolyte broths.",
        "Rest in a cool, ventilated room."
    ],
    "when_to_seek_care": "Within 24 to 48 hours at an urgent care clinic.",
    "escalation_warning_signs": [
        "Fever exceeding 39.5°C (103°F)",
        "Stiff neck or confusion"
    ],
    "follow_up_questions": [
        "What is your highest recorded temperature?"
    ]
})

def test_analyze_symptoms_with_gemma_success():
    req = SymptomAnalysisRequest(
        description="I have had a high fever for 4 days with body aches.",
        severity=5
    )
    mock_client = MagicMock()
    mock_client.chat.return_value = SAMPLE_GEMMA_SYMPTOM_JSON

    res = analyze_symptoms_with_gemma(req, client=mock_client)

    assert res.urgency_level == UrgencyLevel.SEE_DOCTOR_SOON
    assert res.is_emergency is False
    assert res.evaluation_engine == "gemma3:4b (via Ollama)"
    assert len(res.possible_conditions) == 1
    assert res.possible_conditions[0].name == "Viral Syndrome vs Secondary Bacterial Infection"
    assert "112" in res.emergency_contact["india"]
    assert "911" in res.emergency_contact["usa"]
    assert len(res.self_care_measures) == 2
    assert len(res.escalation_warning_signs) == 2


# ==============================================================================
# 4. Critical Healthcare Safety: Emergency Rule Resiliency Tests
# ==============================================================================
def test_emergency_red_flags_bypass_ollama():
    """
    Critical requirement: Emergency red flags must trigger immediate emergency response
    WITHOUT waiting for or calling Ollama, and cannot be overridden by any model.
    """
    payload = {
        "description": "Sudden severe crushing chest pain radiating to left arm and jaw.",
        "severity": 9
    }
    # Notice: requests.post is NOT mocked; if Ollama were called, it would fail.
    # The safety rule must intercept and return 200 with EMERGENCY_CARE directly!
    resp = client.post("/api/symptoms/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["urgency_level"] == "EMERGENCY_CARE"
    assert data["is_emergency"] is True
    assert data["evaluation_engine"] == "clinical_safety_rules_emergency"
    assert "112" in data["emergency_contact"]["india"]


def test_model_cannot_downgrade_baseline_safety_floor():
    """
    If clinical safety rule established SEE_DOCTOR_SOON, the model cannot downgrade it to HOME_CARE.
    """
    req = SymptomAnalysisRequest(
        description="Fever for 4 days",
        severity=6
    )
    # Model attempts to return HOME_CARE
    downgrade_attempt = json.dumps({
        "urgency_level": "HOME_CARE",
        "urgency_title": "Mild",
        "urgency_explanation": "Just rest",
        "extracted_symptoms": ["Fever"],
        "possible_conditions": [],
        "diagnostic_suggestions": [],
        "self_care_measures": ["Rest"],
        "when_to_seek_care": "Never",
        "escalation_warning_signs": ["Worsening"],
        "follow_up_questions": []
    })

    mock_client = MagicMock()
    mock_client.chat.return_value = downgrade_attempt

    # Enforce baseline rule urgency SEE_DOCTOR_SOON
    res = analyze_symptoms_with_gemma(
        req,
        baseline_rule_urgency=UrgencyLevel.SEE_DOCTOR_SOON,
        client=mock_client
    )
    assert res.urgency_level == UrgencyLevel.SEE_DOCTOR_SOON


# ==============================================================================
# 5. Gemma 3:4B Doctor Summary Generation Tests
# ==============================================================================
SAMPLE_GEMMA_DOCTOR_JSON = json.dumps({
    "patient_speaking_script": "\"Doctor, I have had a continuous headache for 3 days that feels like a tight band around my forehead. Over-the-counter paracetamol gave only slight relief.\"",
    "symptoms_and_onset": "Started 3 days ago with gradual onset.",
    "duration_and_progression": "Continuous for 3 days, slightly worse in the evening.",
    "severity_reported": "Self-rated 5/10 dull aching pressure.",
    "associated_symptoms": ["Mild neck stiffness"],
    "medical_history_display": "None reported",
    "current_medications_display": "Paracetamol 500mg occasionally",
    "known_allergies_display": "No known drug allergies",
    "questions_for_doctor": [
        "What specific type of headache does this appear to be?",
        "Are there any red flag signs I should watch for?"
    ],
    "missing_information": [
        "Screen time and sleep hours not recorded."
    ]
})

def test_generate_doctor_summary_with_gemma_success():
    req = DoctorSummaryRequest(
        main_concern="Tension headache for 3 days",
        symptoms=["headache", "neck stiffness"],
        severity=5
    )
    mock_client = MagicMock()
    mock_client.chat.return_value = SAMPLE_GEMMA_DOCTOR_JSON

    res = generate_doctor_summary_with_gemma(req, client=mock_client)

    assert "Doctor, I have had a continuous headache" in res.patient_speaking_script
    assert len(res.questions_for_doctor) == 2
    assert len(res.missing_information) == 1
    assert "educational" in res.disclaimer.lower() or "summary" in res.disclaimer.lower()


# ==============================================================================
# 6. API Router Error Handling & Graceful User Messaging Tests
# ==============================================================================
def test_api_returns_503_on_ollama_offline():
    """Verify clean 503 error without stack traces when Ollama is offline."""
    payload = {
        "description": "Mild skin irritation for two days."
    }
    with patch("app.services.ollama_service.ollama_client.chat", side_effect=OllamaConnectionError(
        "Unable to connect to Ollama at http://localhost:11434. Please verify that the Ollama service is running (`ollama serve`)."
    )):
        resp = client.post("/api/symptoms/analyze", json=payload)
        assert resp.status_code == 503
        data = resp.json()
        assert "Unable to connect to Ollama" in data["detail"]
        assert "ollama serve" in data["detail"]
        assert "traceback" not in resp.text.lower()


def test_api_returns_503_on_model_not_found():
    """Verify clean 503 error instructing user to run `ollama pull gemma3:4b`."""
    payload = {
        "description": "Mild skin irritation for two days."
    }
    with patch("app.services.ollama_service.ollama_client.chat", side_effect=OllamaModelNotFoundError(
        "Model 'gemma3:4b' is not installed in Ollama. Please pull it first by running: `ollama pull gemma3:4b`."
    )):
        resp = client.post("/api/symptoms/analyze", json=payload)
        assert resp.status_code == 503
        data = resp.json()
        assert "ollama pull gemma3:4b" in data["detail"]


def test_api_returns_504_on_timeout():
    """Verify clean 504 gateway timeout on slow inference."""
    payload = {
        "description": "Mild skin irritation for two days."
    }
    with patch("app.services.ollama_service.ollama_client.chat", side_effect=OllamaTimeoutError(
        "Inference with model 'gemma3:4b' timed out after 30.0s."
    )):
        resp = client.post("/api/symptoms/analyze", json=payload)
        assert resp.status_code == 504
        data = resp.json()
        assert "timed out after 30.0s" in data["detail"]

