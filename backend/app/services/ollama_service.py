import json
import logging
import re
import uuid
from typing import Dict, Any, List, Optional, Tuple
import requests

from ..config import settings
from ..schemas.symptom import (
    SymptomAnalysisRequest,
    SymptomAnalysisResponse,
    UrgencyLevel,
    PossibleCondition,
    DiagnosticSuggestion
)
from ..schemas.doctor_summary import (
    DoctorSummaryRequest,
    DoctorSummaryResponse
)

logger = logging.getLogger(__name__)

# ==============================================================================
# Custom Exceptions for Ollama & Gemma 3:4B Integration
# ==============================================================================
class OllamaError(Exception):
    """Base exception for all Ollama integration errors."""
    pass

class OllamaConnectionError(OllamaError):
    """Raised when the backend cannot reach the local Ollama daemon."""
    pass

class OllamaModelNotFoundError(OllamaError):
    """Raised when the requested model (e.g. gemma3:4b) is not installed."""
    pass

class OllamaTimeoutError(OllamaError):
    """Raised when local inference times out."""
    pass

class OllamaResponseError(OllamaError):
    """Raised when the model returns empty or unparseable output."""
    pass

class OllamaServiceError(OllamaError):
    """Raised when Ollama returns an unexpected HTTP error code."""
    pass


# ==============================================================================
# JSON Extraction & Sanitization Utility
# ==============================================================================
def extract_and_parse_json(text: str) -> Dict[str, Any]:
    """
    Safely extracts and parses JSON from raw LLM output,
    handling markdown fences (```json ... ```) or surrounding prose.
    """
    if not text or not text.strip():
        raise OllamaResponseError("Model returned an empty text response.")

    cleaned = text.strip()

    # Strip markdown code blocks if present
    if "```" in cleaned:
        # Match ```json ... ``` or ``` ... ```
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
        if fence_match:
            cleaned = fence_match.group(1).strip()

    # Direct JSON parse attempt
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Substring search for outermost { ... }
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = cleaned[first_brace:last_brace + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as err:
            logger.warning(f"Failed to parse extracted JSON substring: {err}")

    raise OllamaResponseError(
        "Failed to parse valid JSON from the AI model output. Please retry your request."
    )


# ==============================================================================
# Ollama Client Adapter
# ==============================================================================
class OllamaClient:
    """
    Low-level HTTP adapter communicating with Ollama's /api/chat endpoint.
    Configured specifically for Google Gemma 3:4B ('gemma3:4b').
    """
    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.AI_MODEL
        self.timeout = timeout or settings.OLLAMA_TIMEOUT_SECONDS

    def check_availability(self) -> Tuple[bool, str]:
        """
        Pings Ollama's /api/tags endpoint to verify daemon connectivity
        and check if the required model is pulled.
        Returns (is_available, message).
        """
        tags_url = f"{self.base_url}/api/tags"
        try:
            resp = requests.get(tags_url, timeout=5.0)
            if resp.status_code != 200:
                return False, f"Ollama returned HTTP status {resp.status_code}."
            
            data = resp.json()
            models = [m.get("name", "") for m in data.get("models", [])]
            # Match exact tag or tag without :latest
            model_present = any(
                self.model in m or m.startswith(self.model) for m in models
            )
            if not model_present:
                return False, (
                    f"Model '{self.model}' not found in Ollama models ({', '.join(models) if models else 'none'}). "
                    f"Run `ollama pull {self.model}` to install."
                )
            return True, f"Model '{self.model}' is available on {self.base_url}."
        except requests.exceptions.ConnectionError:
            return False, f"Cannot connect to Ollama at {self.base_url}. Ensure 'ollama serve' is running."
        except Exception as e:
            return False, f"Ollama availability check failed: {str(e)}"

    def chat(
        self,
        messages: List[Dict[str, str]],
        format: str = "json",
        temperature: float = 0.2
    ) -> str:
        """
        Sends chat completion request to Ollama /api/chat.
        """
        chat_url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "format": format,
            "options": {
                "temperature": temperature
            }
        }

        try:
            resp = requests.post(chat_url, json=payload, timeout=self.timeout)
        except requests.exceptions.ConnectionError as err:
            logger.error(f"Ollama connection error at {chat_url}: {err}")
            raise OllamaConnectionError(
                f"Unable to connect to Ollama at {self.base_url}. "
                "Please verify that the Ollama service is running (`ollama serve`)."
            ) from err
        except requests.exceptions.Timeout as err:
            logger.error(f"Ollama request timeout after {self.timeout}s: {err}")
            raise OllamaTimeoutError(
                f"Inference with model '{self.model}' timed out after {self.timeout}s. "
                "Ensure your system has sufficient CPU/GPU and RAM resources for Gemma 3:4B."
            ) from err
        except requests.exceptions.RequestException as err:
            logger.error(f"Ollama HTTP request exception: {err}")
            raise OllamaServiceError(f"Network request to Ollama failed: {str(err)}") from err

        if resp.status_code == 404:
            body = resp.text.lower()
            if "not found" in body or self.model in body:
                raise OllamaModelNotFoundError(
                    f"Model '{self.model}' is not installed in Ollama. "
                    f"Please pull it first by running: `ollama pull {self.model}`."
                )
            raise OllamaServiceError(f"Ollama endpoint {chat_url} not found (HTTP 404).")

        if resp.status_code != 200:
            error_detail = ""
            try:
                error_detail = resp.json().get("error", "")
            except Exception:
                error_detail = resp.text[:200]
            raise OllamaServiceError(
                f"Ollama error (HTTP {resp.status_code}): {error_detail or 'Internal Server Error'}"
            )

        try:
            data = resp.json()
        except Exception as err:
            raise OllamaResponseError(f"Invalid JSON response from Ollama daemon: {err}")

        message_obj = data.get("message", {})
        content = message_obj.get("content", "")
        if not content:
            raise OllamaResponseError(f"Model '{self.model}' returned an empty message.")

        return content


# Shared Ollama client instance
ollama_client = OllamaClient()


# ==============================================================================
# Gemma 3:4B Clinical Symptom Analysis Service
# ==============================================================================
def analyze_symptoms_with_gemma(
    req: SymptomAnalysisRequest,
    baseline_rule_urgency: Optional[UrgencyLevel] = None,
    client: Optional[OllamaClient] = None
) -> SymptomAnalysisResponse:
    """
    Executes symptom analysis using Google Gemma 3:4B via Ollama.
    Guarantees strict schema validation and preserves conservative clinical boundaries.
    """
    active_client = client or ollama_client

    # Formulate clinical context and instructions
    system_prompt = (
        "You are Medisense AI, a clinical decision support assistant powered by Google Gemma 3 (4B parameters).\n"
        "Your role is to analyze patient-reported symptoms and provide structured, educational, and safety-focused guidance.\n\n"
        "STRICT CLINICAL SAFETY RULES:\n"
        "1. You are NOT a medical doctor. NEVER claim to provide a definitive diagnosis or replace professional consultation.\n"
        "2. Label all potential conditions as 'possibilities' for a doctor to investigate, never confirmed diagnoses.\n"
        "3. NEVER prescribe, invent specific medication dosages, or recommend prescription drugs.\n"
        "4. Assign an urgency_level strictly from this enum:\n"
        "   - 'EMERGENCY_CARE': For immediate life-threatening danger (acute chest pain, stroke signs, severe respiratory failure).\n"
        "   - 'SEE_DOCTOR_SOON': For moderate or persistent issues needing medical evaluation within 24-48 hours.\n"
        "   - 'ROUTINE_APPOINTMENT': For chronic, subacute, or mild recurring complaints requiring a scheduled visit.\n"
        "   - 'HOME_CARE': For mild, acute, self-limiting discomfort without red flags.\n"
        "5. If red flag symptoms are present, ALWAYS select 'EMERGENCY_CARE'. Never downgrade emergency risks.\n"
        "6. Provide non-pharmacological self-care measures, clear escalation signs, and targeted follow-up questions for missing details.\n"
        "7. Return ONLY a valid JSON object matching the exact schema specified."
    )

    # Gather user context details
    context_lines = [
        f"Primary symptom description: {req.description}",
        f"Selected symptoms: {', '.join(req.selected_symptoms) if req.selected_symptoms else 'None specified'}",
        f"Onset: {req.onset or 'Not specified'}",
        f"Severity rating: {f'{req.severity}/10' if req.severity is not None else 'Not specified'}",
        f"Progression: {req.progression or 'Not specified'}",
        f"Age demographic: {req.age_range or 'Adult'}",
        f"Medical history: {', '.join(req.medical_history) if req.medical_history else 'None reported'}",
        f"Current medications: {', '.join(req.current_medications) if req.current_medications else 'None reported'}",
        f"Known allergies: {', '.join(req.known_allergies) if req.known_allergies else 'None reported'}",
        f"Associated symptoms: {', '.join(req.associated_symptoms) if req.associated_symptoms else 'None reported'}"
    ]

    if req.follow_up_answers:
        qa_pairs = [f"Q: {k} | A: {v}" for k, v in req.follow_up_answers.items()]
        context_lines.append(f"Follow-up responses: {'; '.join(qa_pairs)}")

    if baseline_rule_urgency and baseline_rule_urgency != UrgencyLevel.HOME_CARE:
        context_lines.append(f"Baseline clinical rule recommendation: {baseline_rule_urgency.value} (safety floor)")

    user_prompt = (
        "Please analyze the following patient symptoms and generate a comprehensive clinical triage assessment in JSON:\n\n"
        + "\n".join(context_lines)
        + "\n\n"
        "Required JSON format:\n"
        "{\n"
        '  "urgency_level": "EMERGENCY_CARE" | "SEE_DOCTOR_SOON" | "ROUTINE_APPOINTMENT" | "HOME_CARE",\n'
        '  "urgency_title": "Short title describing urgency",\n'
        '  "urgency_explanation": "Clear explanation of why this urgency level was assigned",\n'
        '  "extracted_symptoms": ["Symptom 1", "Symptom 2"],\n'
        '  "possible_conditions": [\n'
        '    {\n'
        '      "name": "Condition name",\n'
        '      "simple_explanation": "Patient-friendly explanation",\n'
        '      "typical_symptoms": ["Typical symptom 1", "Typical symptom 2"],\n'
        '      "matching_symptoms": ["Matching symptom"],\n'
        '      "missing_information_or_uncertainty": "What clinical info is missing to confirm",\n'
        '      "professional_evaluation_needed": true\n'
        '    }\n'
        '  ],\n'
        '  "diagnostic_suggestions": [\n'
        '    {\n'
        '      "category": "Diagnostic category (e.g. Physical Exam, Laboratory, Imaging)",\n'
        '      "examples": ["Test 1", "Test 2"],\n'
        '      "why_clinician_considers": "Why a doctor might order this",\n'
        '      "important_note": "Educational note regarding clinician discretion"\n'
        '    }\n'
        '  ],\n'
        '  "self_care_measures": ["Self care step 1", "Self care step 2"],\n'
        '  "when_to_seek_care": "Guidance on timing and threshold for seeing a doctor",\n'
        '  "escalation_warning_signs": ["Warning sign 1", "Warning sign 2"],\n'
        '  "follow_up_questions": ["Clarifying question 1", "Clarifying question 2"]\n'
        "}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    # Query Gemma 3:4B via Ollama
    raw_response = active_client.chat(messages, format="json", temperature=0.2)
    parsed_json = extract_and_parse_json(raw_response)

    # Validate and normalize urgency level
    raw_urgency = parsed_json.get("urgency_level", "").upper().replace(" ", "_")
    valid_urgencies = {e.value: e for e in UrgencyLevel}
    urgency_level = valid_urgencies.get(raw_urgency, UrgencyLevel.HOME_CARE)

    # SAFETY CHECK: Model cannot downgrade safety rule urgency floor!
    if baseline_rule_urgency:
        priority_map = {
            UrgencyLevel.HOME_CARE: 1,
            UrgencyLevel.ROUTINE_APPOINTMENT: 2,
            UrgencyLevel.SEE_DOCTOR_SOON: 3,
            UrgencyLevel.EMERGENCY_CARE: 4
        }
        if priority_map[urgency_level] < priority_map[baseline_rule_urgency]:
            logger.info(
                f"Clinical safety floor applied: Upgrading model urgency {urgency_level} to {baseline_rule_urgency}"
            )
            urgency_level = baseline_rule_urgency

    # Parse possible conditions
    possible_conditions = []
    for c in parsed_json.get("possible_conditions", []):
        if isinstance(c, dict) and c.get("name"):
            possible_conditions.append(
                PossibleCondition(
                    name=str(c.get("name", "Possible Condition")),
                    simple_explanation=str(c.get("simple_explanation", "Condition matching reported symptoms.")),
                    typical_symptoms=[str(s) for s in c.get("typical_symptoms", []) if s] or ["Non-specific discomfort"],
                    matching_symptoms=[str(s) for s in c.get("matching_symptoms", []) if s] or [req.description[:40]],
                    missing_information_or_uncertainty=str(c.get("missing_information_or_uncertainty", "Requires doctor examination.")),
                    professional_evaluation_needed=bool(c.get("professional_evaluation_needed", True))
                )
            )

    if not possible_conditions:
        possible_conditions.append(
            PossibleCondition(
                name="Symptom Complex Under Evaluation",
                simple_explanation="Symptoms reported require clinical correlation with a primary care clinician.",
                typical_symptoms=["Mild malaise", "Non-specific discomfort"],
                matching_symptoms=req.selected_symptoms or [req.description[:40]],
                missing_information_or_uncertainty="Physical examination and detailed medical history required.",
                professional_evaluation_needed=True
            )
        )

    # Parse diagnostic suggestions
    diagnostics = []
    for d in parsed_json.get("diagnostic_suggestions", []):
        if isinstance(d, dict) and d.get("category"):
            diagnostics.append(
                DiagnosticSuggestion(
                    category=str(d.get("category", "General Clinical Evaluation")),
                    examples=[str(e) for e in d.get("examples", []) if e] or ["Physical examination"],
                    why_clinician_considers=str(d.get("why_clinician_considers", "To evaluate symptom origin.")),
                    important_note=str(d.get("important_note", "Decided by treating clinician."))
                )
            )

    if not diagnostics:
        diagnostics.append(
            DiagnosticSuggestion(
                category="Primary Care Physical Examination",
                examples=["Vital sign measurement", "Symptom-focused physical exam"],
                why_clinician_considers="Baseline physical evaluation to guide diagnostic decisions.",
                important_note="Your doctor determines which specific tests are necessary."
            )
        )

    # Extract self-care and escalation
    self_care = [str(s) for s in parsed_json.get("self_care_measures", []) if s]
    if not self_care:
        self_care = [
            "Rest adequately and maintain optimal hydration with water and warm fluids.",
            "Avoid strenuous activities until feeling well.",
            "Monitor symptoms closely for any worsening."
        ]

    escalation = [str(s) for s in parsed_json.get("escalation_warning_signs", []) if s]
    if not escalation:
        escalation = [
            "Development of sudden severe pain or high fever",
            "Shortness of breath or difficulty breathing",
            "Confusion, dizziness, or fainting"
        ]

    follow_ups = [str(q) for q in parsed_json.get("follow_up_questions", []) if q]
    extracted_symptoms = [str(s) for s in parsed_json.get("extracted_symptoms", []) if s]
    if not extracted_symptoms:
        extracted_symptoms = req.selected_symptoms or [req.description[:50]]

    when_to_seek = str(parsed_json.get("when_to_seek_care", "If symptoms worsen or fail to improve over 3 to 5 days."))
    urgency_title = str(parsed_json.get("urgency_title", f"{urgency_level.value.replace('_', ' ').title()}"))
    urgency_explanation = str(parsed_json.get("urgency_explanation", "Evaluation completed by Medisense AI safety engine."))

    return SymptomAnalysisResponse(
        urgency_level=urgency_level,
        urgency_title=urgency_title,
        urgency_explanation=urgency_explanation,
        is_emergency=(urgency_level == UrgencyLevel.EMERGENCY_CARE),
        extracted_symptoms=extracted_symptoms[:6],
        possible_conditions=possible_conditions[:3],
        diagnostic_suggestions=diagnostics[:3],
        self_care_measures=self_care[:5],
        when_to_seek_care=when_to_seek,
        escalation_warning_signs=escalation[:4],
        follow_up_questions=follow_ups[:3],
        evaluation_engine=f"gemma3:4b (via Ollama)"
    )


# ==============================================================================
# Gemma 3:4B Doctor Consultation Summary Generator
# ==============================================================================
def generate_doctor_summary_with_gemma(
    req: DoctorSummaryRequest,
    client: Optional[OllamaClient] = None
) -> DoctorSummaryResponse:
    """
    Generates a structured doctor consultation preparation brief using Google Gemma 3:4B.
    Produces an articulate patient speaking script, questions for doctor, and missing info.
    """
    active_client = client or ollama_client

    system_prompt = (
        "You are Medisense AI, helping a patient prepare for their doctor consultation.\n"
        "Your task is to synthesize the patient's reported symptoms and history into a clear, empathetic, "
        "and structured consultation brief ('What Should I Tell My Doctor?').\n\n"
        "STRICT DIRECTIVES:\n"
        "1. Write a clear, respectful first-person patient speaking script that the patient can read or speak directly to their doctor.\n"
        "2. Formulate 3-4 intelligent, high-yield questions for the patient to ask their doctor.\n"
        "3. Explicitly identify any clinically relevant information that is missing (e.g. onset, severity, progression, allergies, current medications).\n"
        "4. Do NOT attempt to provide a diagnosis or recommend treatments.\n"
        "5. Return ONLY a valid JSON object matching the requested schema."
    )

    details = [
        f"Main concern: {req.main_concern}",
        f"Symptoms: {', '.join(req.symptoms) if req.symptoms else req.main_concern}",
        f"Onset: {req.onset or 'Not specified'}",
        f"Duration: {req.duration or 'Not specified'}",
        f"Progression: {req.progression or 'Not specified'}",
        f"Severity: {f'{req.severity}/10' if req.severity is not None else 'Not specified'}",
        f"Associated symptoms: {', '.join(req.associated_symptoms) if req.associated_symptoms else 'None noted'}",
        f"Prior medical history: {', '.join(req.medical_history) if req.medical_history else 'None reported'}",
        f"Current medications: {', '.join(req.current_medications) if req.current_medications else 'None reported'}",
        f"Known allergies: {', '.join(req.known_allergies) if req.known_allergies else 'None reported'}",
        f"Patient questions: {', '.join(req.user_questions) if req.user_questions else 'None provided'}",
        f"Additional notes: {req.notes or 'None'}"
    ]

    user_prompt = (
        "Synthesize this patient intake into a structured consultation preparation summary in JSON format:\n\n"
        + "\n".join(details)
        + "\n\n"
        "Required JSON format:\n"
        "{\n"
        '  "patient_speaking_script": "Doctor, my primary concern is ... I have noticed ...",\n'
        '  "symptoms_and_onset": "Started: ... Symptoms: ...",\n'
        '  "duration_and_progression": "Duration: ... Progression: ...",\n'
        '  "severity_reported": "Self-rated severity: ...",\n'
        '  "associated_symptoms": ["Symptom 1", "Symptom 2"],\n'
        '  "medical_history_display": "Medical conditions summary",\n'
        '  "current_medications_display": "Medications summary",\n'
        '  "known_allergies_display": "Allergies summary",\n'
        '  "questions_for_doctor": ["Question 1", "Question 2", "Question 3"],\n'
        '  "missing_information": ["Missing info item 1", "Missing info item 2"]\n'
        "}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    raw_response = active_client.chat(messages, format="json", temperature=0.3)
    parsed = extract_and_parse_json(raw_response)

    # Ensure patient speaking script is well-formed
    concern = req.main_concern.strip()
    script = str(parsed.get("patient_speaking_script", "")).strip()
    if not script:
        symptoms_text = ", ".join(req.symptoms) if req.symptoms else concern
        script = (
            f"\"Doctor, my primary concern is {concern}. "
            f"I have been noticing {symptoms_text}. "
            f"I would appreciate your assessment on what might be causing this and what examinations you recommend.\""
        )

    # Fallback missing information checklist if empty
    missing = [str(m) for m in parsed.get("missing_information", []) if m]
    if not missing:
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

    # Fallback doctor questions
    questions = [str(q) for q in parsed.get("questions_for_doctor", []) if q]
    if not questions:
        questions = [
            f"What do you suspect could be the primary cause of my {concern}?",
            "Are there specific diagnostic tests or exams you recommend at this stage?",
            "What warning signs should prompt me to seek urgent care before our next follow-up?",
            "Are there any activities, foods, or over-the-counter medicines I should avoid while recovering?"
        ]

    # Display strings
    history_disp = str(parsed.get("medical_history_display", "")) or (", ".join(req.medical_history) if req.medical_history else "Not provided")
    meds_disp = str(parsed.get("current_medications_display", "")) or (", ".join(req.current_medications) if req.current_medications else "Not provided")
    allergies_disp = str(parsed.get("known_allergies_display", "")) or (", ".join(req.known_allergies) if req.known_allergies else "No known drug allergies reported")
    onset_disp = str(parsed.get("symptoms_and_onset", "")) or f"Started: {req.onset or 'Recently'}. Reported: {', '.join(req.symptoms) or concern}."
    prog_disp = str(parsed.get("duration_and_progression", "")) or f"Duration: {req.duration or 'Not specified'}. Progression: {req.progression or 'Fluctuating'}."
    sev_disp = str(parsed.get("severity_reported", "")) or f"Self-rated severity: {f'{req.severity}/10' if req.severity is not None else 'Mild to moderate'}."

    assoc = [str(a) for a in parsed.get("associated_symptoms", []) if a] or req.associated_symptoms or ["None reported"]

    return DoctorSummaryResponse(
        id=str(uuid.uuid4()),
        main_concern=concern,
        patient_speaking_script=script,
        symptoms_and_onset=onset_disp,
        duration_and_progression=prog_disp,
        severity_reported=sev_disp,
        associated_symptoms=assoc,
        medical_history_display=history_disp,
        current_medications_display=meds_disp,
        known_allergies_display=allergies_disp,
        questions_for_doctor=questions[:5],
        missing_information=missing
    )

