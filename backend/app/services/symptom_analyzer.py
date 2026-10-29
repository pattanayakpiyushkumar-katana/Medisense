import json
import logging
from typing import Dict, Any, List, Optional
from ..schemas.symptom import (
    SymptomAnalysisRequest,
    SymptomAnalysisResponse,
    UrgencyLevel,
    PossibleCondition,
    DiagnosticSuggestion
)
from ..services.triage_rules import (
    evaluate_emergency_rules,
    evaluate_prompt_care_rules,
    evaluate_routine_rules
)
from ..config import settings

logger = logging.getLogger(__name__)

# Common symptom dictionary for keyword mapping & extraction
SYMPTOM_KNOWLEDGE_BASE = {
    "headache": {
        "conditions": [
            {
                "name": "Tension-Type Headache",
                "explanation": "The most common type of headache, often described as a tight band or dull pressure around the forehead or back of the head, commonly linked to stress, eye strain, or muscle tension.",
                "typical": ["Dull aching head pain", "Sensation of tightness or pressure across forehead", "Tenderness on scalp or neck muscles"],
                "missing": "Duration of headache, recent sleep patterns, caffeine intake, screen time.",
                "eval_needed": False
            },
            {
                "name": "Migraine (Without Aura)",
                "explanation": "A recurrent throbbing or pulsating headache usually affecting one side of the head, frequently accompanied by sensitivity to light/sound and nausea.",
                "typical": ["Throbbing unilateral pain", "Sensitivity to light/sound", "Nausea or loss of appetite"],
                "missing": "Family history of migraine, unilateral vs bilateral pain, visual aura symptoms.",
                "eval_needed": True
            }
        ],
        "diagnostics": [
            {
                "category": "Clinical Physical & Neurological Examination",
                "examples": ["Cranial nerve testing", "Fundoscopy (eye back check)", "Blood pressure measurement"],
                "why_clinician_considers": "To confirm normal neurological reflexes and rule out elevated intracranial pressure or secondary headache causes.",
                "important_note": "A clinician decides if imaging (CT/MRI) is necessary based on neurological findings and 'red flags'."
            }
        ],
        "self_care": [
            "Rest in a quiet, dark, well-ventilated room with cool compress on forehead.",
            "Maintain hydration with plenty of water.",
            "Avoid skipping meals and minimize prolonged screen exposure."
        ],
        "escalation": [
            "Sudden explosive 'thunderclap' onset reaching peak within seconds",
            "Headache accompanied by high fever, neck stiffness, confusion, or weakness",
            "New headache appearing after a head injury"
        ]
    },
    "fever": {
        "conditions": [
            {
                "name": "Acute Viral Upper Respiratory Infection",
                "explanation": "A common self-limiting viral infection causing low-grade fever, malaise, body aches, and respiratory symptoms.",
                "typical": ["Low-to-moderate fever", "Fatigue", "Runny nose", "Mild sore throat"],
                "missing": "Specific temperature reading, duration of fever, presence of cough or rashes.",
                "eval_needed": False
            },
            {
                "name": "Bacterial Infection (e.g., Tonsillitis, Sinusitis, or UTI)",
                "explanation": "A localized bacterial infection that may present with high or spiking fever, localized severe pain, and purulent discharge.",
                "typical": ["High persistent fever (> 38.5°C / 101.3°F)", "Localized severe throat/ear/flank pain", "Chills and rigors"],
                "missing": "Presence of localized pain, burning with urination, or white exudate on tonsils.",
                "eval_needed": True
            }
        ],
        "diagnostics": [
            {
                "category": "Basic Laboratory Investigations",
                "examples": ["Complete Blood Count (CBC)", "C-Reactive Protein (CRP)", "Urinalysis"],
                "why_clinician_considers": "Helps distinguish viral vs bacterial patterns and check white blood cell response.",
                "important_note": "Laboratory tests are ordered based on duration of fever and localized examination findings."
            }
        ],
        "self_care": [
            "Sip oral fluids, clear broths, and ORS solution to prevent dehydration.",
            "Wear light, breathable clothing and rest adequately in a cool room.",
            "Tepid sponging with lukewarm water if uncomfortable."
        ],
        "escalation": [
            "Fever exceeding 39.4°C (103°F) or fever lasting more than 72 hours",
            "Appearance of a new dark purple or red non-blanching skin rash",
            "Severe confusion, difficulty waking up, or difficulty breathing"
        ]
    },
    "cough": {
        "conditions": [
            {
                "name": "Acute Bronchitis (Viral)",
                "explanation": "Inflammation of the airways often following a common cold, causing a persistent dry or mildly productive cough for 1 to 3 weeks.",
                "typical": ["Persistent cough", "Mild chest soreness when coughing", "Low fever or tiredness"],
                "missing": "Presence of colored mucus, history of asthma or smoking, lung sounds.",
                "eval_needed": True
            },
            {
                "name": "Allergic Cough / Post-Nasal Drip",
                "explanation": "Cough caused by mucous dripping down the throat from allergic rhinitis or sinus irritation.",
                "typical": ["Dry tickling cough worse at night or morning", "Frequent throat clearing", "Sneezing"],
                "missing": "Known seasonal allergies, exposure to dust or pets.",
                "eval_needed": False
            }
        ],
        "diagnostics": [
            {
                "category": "Chest & Pulmonary Assessment",
                "examples": ["Chest Auscultation (Stethoscope)", "Pulse Oximetry (SpO2)", "Chest X-ray if indicated"],
                "why_clinician_considers": "To listen for crackles, wheezing, or consolidated lung sounds.",
                "important_note": "Chest X-rays are typically reserved if pneumonia or chronic lung pathology is suspected."
            }
        ],
        "self_care": [
            "Sip warm fluids such as herbal tea with a spoonful of honey (not for infants under 1 year).",
            "Use a cool-mist room humidifier or steam inhalation to soothe airway irritation.",
            "Elevate your head slightly while sleeping."
        ],
        "escalation": [
            "Coughing up blood or rust-colored sputum",
            "Shortness of breath or rapid labored breathing",
            "Severe sharp chest pain that worsens on breathing in"
        ]
    },
    "stomach": {
        "conditions": [
            {
                "name": "Acute Viral Gastroenteritis (Stomach Flu)",
                "explanation": "Short-term inflammation of the stomach and intestines causing nausea, abdominal cramps, and diarrhea.",
                "typical": ["Cramping stomach pain", "Nausea or mild vomiting", "Watery diarrhea"],
                "missing": "Frequency of bowel movements, ability to keep fluids down, presence of blood.",
                "eval_needed": False
            },
            {
                "name": "Acid Gastritis / Indigestion (Dyspepsia)",
                "explanation": "Irritation of the stomach lining causing burning upper abdominal discomfort, bloating, and early satiety.",
                "typical": ["Upper abdominal burning pain", "Bloating", "Belching or acidic taste"],
                "missing": "Relation to food, use of painkillers (NSAIDs) or spicy foods.",
                "eval_needed": True
            }
        ],
        "diagnostics": [
            {
                "category": "Gastrointestinal Evaluation",
                "examples": ["Abdominal palpation examination", "Stool microscopy / culture", "Abdominal ultrasound if indicated"],
                "why_clinician_considers": "To localize tenderness, rule out surgical abdomen (e.g. appendicitis), and assess hydration.",
                "important_note": "A doctor determines whether ultrasound or blood tests are necessary based on pain quadrant."
            }
        ],
        "self_care": [
            "Drink oral rehydration solutions (ORS) in small, frequent sips.",
            "Eat bland, easy-to-digest foods (rice, bananas, toast, applesauce) when hungry.",
            "Avoid spicy, greasy foods, alcohol, and excessive caffeine."
        ],
        "escalation": [
            "Severe sharp pain in the lower right abdomen (possible appendicitis)",
            "Vomiting blood or dark black tarry stools",
            "Inability to retain any liquids for more than 24 hours"
        ]
    }
}

def analyze_symptoms(request: SymptomAnalysisRequest) -> SymptomAnalysisResponse:
    """
    Core symptom triage engine combining hardcoded safety rules,
    clinical pattern synthesis, and fallback guarantees.
    """
    # Step 1: Emergency Rules Evaluation (Top Priority Safety Layer)
    emergency_hit = evaluate_emergency_rules(
        description=request.description,
        selected_symptoms=request.selected_symptoms,
        age_range=request.age_range,
        severity=request.severity
    )

    if emergency_hit:
        return SymptomAnalysisResponse(
            urgency_level=emergency_hit["urgency_level"],
            urgency_title=emergency_hit["urgency_title"],
            urgency_explanation=emergency_hit["reason"],
            is_emergency=True,
            extracted_symptoms=request.selected_symptoms or [request.description[:50]],
            possible_conditions=[
                PossibleCondition(
                    name="Potential Acute Medical Emergency",
                    simple_explanation="Symptoms match clinical indicators that require immediate hospital or emergency evaluation to rule out life-threatening conditions.",
                    typical_symptoms=["Severe or acute symptom presentation", "Signs of organ compromise"],
                    matching_symptoms=[s for s in (request.selected_symptoms or []) if s] or ["Reported severe symptoms"],
                    missing_information_or_uncertainty="Full vital signs, oxygen saturation, ECG, and emergency physician examination required.",
                    professional_evaluation_needed=True
                )
            ],
            diagnostic_suggestions=[
                DiagnosticSuggestion(
                    category="Immediate Emergency Department Diagnostics",
                    examples=["12-lead Electrocardiogram (ECG)", "Stat Blood Gas / Cardiac Markers", "Continuous Vital Sign Monitoring"],
                    why_clinician_considers="Rapid assessment of cardiac, respiratory, or neurological stability.",
                    important_note="These are standard emergency department protocols determined by the triage medical team."
                )
            ],
            self_care_measures=[
                "DO NOT attempt home remedies or wait for clinic hours.",
                "Sit or lie down in a safe, comfortable position while waiting for help.",
                "Unlock your front door so emergency responders can enter.",
                "Have someone stay with you if possible."
            ],
            when_to_seek_care="IMMEDIATELY. Do not delay emergency transport.",
            escalation_warning_signs=[
                "Loss of consciousness",
                "Worsening difficulty breathing",
                "Severe worsening chest pain",
                "Cyanosis (blue lips or nails)"
            ],
            follow_up_questions=[],
            evaluation_engine="clinical_safety_rules_emergency"
        )

    # Step 2: Check Prompt Care Rules (Within 24-48 Hours)
    prompt_hit = evaluate_prompt_care_rules(
        description=request.description,
        selected_symptoms=request.selected_symptoms
    )

    # Step 3: Check Routine Rules
    routine_hit = evaluate_routine_rules(
        description=request.description,
        selected_symptoms=request.selected_symptoms
    )

    # Determine Urgency Level based on rules and severity
    if prompt_hit:
        urgency_level = prompt_hit["urgency_level"]
        urgency_title = prompt_hit["urgency_title"]
        urgency_explanation = prompt_hit["reason"]
        when_to_seek = "Within 24 to 48 hours with an urgent care physician or general practitioner."
    elif routine_hit:
        urgency_level = routine_hit["urgency_level"]
        urgency_title = routine_hit["urgency_title"]
        urgency_explanation = routine_hit["reason"]
        when_to_seek = "Schedule a routine appointment at your doctor's office over the coming days or weeks."
    elif request.severity and request.severity >= 6:
        urgency_level = UrgencyLevel.SEE_DOCTOR_SOON
        urgency_title = "See a Doctor Soon (Moderate Severity Reported)"
        urgency_explanation = f"Your self-reported pain/severity level of {request.severity}/10 suggests discomfort that warrants timely professional clinical evaluation."
        when_to_seek = "Within 1 to 2 days if symptoms do not steadily improve."
    else:
        urgency_level = UrgencyLevel.HOME_CARE
        urgency_title = "Home Care and Monitoring (Low-Risk Indicators)"
        urgency_explanation = "Based on your description without red flags, your symptoms currently appear consistent with mild, self-limiting issues suitable for supportive self-care and close monitoring."
        when_to_seek = "If symptoms do not improve after 3 to 5 days, or if any escalation warning signs develop."

    # If Ollama provider is configured, analyze symptoms using Gemma 3:4B
    if settings.AI_PROVIDER == "ollama":
        from .ollama_service import analyze_symptoms_with_gemma
        return analyze_symptoms_with_gemma(request, baseline_rule_urgency=urgency_level)

    # Extract symptoms from text
    extracted = list(request.selected_symptoms or [])
    lower_desc = request.description.lower()
    for key in ["headache", "fever", "cough", "tired", "fatigue", "nausea", "stomach", "vomiting", "sore throat", "body ache"]:
        if key in lower_desc and key not in extracted:
            extracted.append(key.capitalize())

    if not extracted:
        extracted = ["Unspecified mild discomfort"]

    # Build possible conditions and advice from knowledge base
    matched_conditions = []
    matched_diagnostics = []
    matched_self_care = [
        "Ensure adequate rest and 7-8 hours of sleep.",
        "Drink plenty of water and warm fluids throughout the day.",
        "Eat light, wholesome meals with fresh produce."
    ]
    matched_escalation = [
        "Development of sudden high fever (> 38.5°C / 101.3°F)",
        "Shortness of breath or chest pain",
        "Persistent vomiting or inability to retain fluids"
    ]

    found_kb = False
    for kw, kb_data in SYMPTOM_KNOWLEDGE_BASE.items():
        if kw in lower_desc or any(kw in s.lower() for s in extracted):
            found_kb = True
            for c in kb_data["conditions"]:
                matched_conditions.append(
                    PossibleCondition(
                        name=c["name"],
                        simple_explanation=c["explanation"],
                        typical_symptoms=c["typical"],
                        matching_symptoms=[s for s in extracted if any(w in s.lower() for w in ["head", "fever", "cough", "ache", "stomach", "tired"])],
                        missing_information_or_uncertainty=c["missing"],
                        professional_evaluation_needed=c["eval_needed"]
                    )
                )
            for d in kb_data["diagnostics"]:
                matched_diagnostics.append(
                    DiagnosticSuggestion(
                        category=d["category"],
                        examples=d["examples"],
                        why_clinician_considers=d["why_clinician_considers"],
                        important_note=d["important_note"]
                    )
                )
            matched_self_care.extend(kb_data["self_care"])
            matched_escalation.extend(kb_data["escalation"])

    if not found_kb:
        matched_conditions.append(
            PossibleCondition(
                name="Non-Specific Mild Symptom Complex",
                simple_explanation="A combination of non-urgent symptoms that can arise from temporary physical fatigue, mild viral exposure, dehydration, or lifestyle factors.",
                typical_symptoms=["Mild fatigue", "Low energy", "Mild malaise"],
                matching_symptoms=extracted,
                missing_information_or_uncertainty="Vital signs, timeline of symptom development, specific physical triggers.",
                professional_evaluation_needed=False
            )
        )
        matched_diagnostics.append(
            DiagnosticSuggestion(
                category="Standard Physical Assessment",
                examples=["Temperature check", "Pulse and blood pressure measurement", "Physical examination"],
                why_clinician_considers="Basic baseline evaluation to detect any subtle objective signs.",
                important_note="Routine examinations are decided by your healthcare provider after taking your medical history."
            )
        )

    # Deduplicate lists
    matched_self_care = list(dict.fromkeys(matched_self_care))[:5]
    matched_escalation = list(dict.fromkeys(matched_escalation))[:4]
    if len(matched_conditions) > 3:
        matched_conditions = matched_conditions[:3]

    # Generate follow-up questions if needed
    follow_ups = []
    if not request.onset:
        follow_ups.append("Approximately how many days or hours ago did these symptoms begin?")
    if request.severity is None:
        follow_ups.append("On a scale from 1 (very mild) to 10 (unbearable), how severe is the discomfort?")
    if not request.progression:
        follow_ups.append("Are the symptoms steadily worsening, improving, or staying about the same?")

    return SymptomAnalysisResponse(
        urgency_level=urgency_level,
        urgency_title=urgency_title,
        urgency_explanation=urgency_explanation,
        is_emergency=False,
        extracted_symptoms=extracted,
        possible_conditions=matched_conditions,
        diagnostic_suggestions=matched_diagnostics[:2],
        self_care_measures=matched_self_care,
        when_to_seek_care=when_to_seek,
        escalation_warning_signs=matched_escalation,
        follow_up_questions=follow_ups[:3],
        evaluation_engine="clinical_rule_engine_demo"
    )

