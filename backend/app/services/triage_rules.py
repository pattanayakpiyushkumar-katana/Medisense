from typing import Dict, Any, List, Optional
import re
from ..schemas.symptom import UrgencyLevel

# Emergency red flag regex patterns
EMERGENCY_PATTERNS = [
    (r"\b(crushing|radiating|tight|pressure)\s+(chest\s+pain|chest)\b", "Severe chest pressure or potential acute coronary syndrome"),
    (r"\bchest\s+pain\b", "Chest pain requiring immediate medical exclusion of acute cardiac or pulmonary emergency"),
    (r"\b(can'?t\s+breathe|severe\s+difficulty\s+breathing|gasping|struggling\s+to\s+breathe|suffocating)\b", "Acute respiratory distress"),
    (r"\b(slurred\s+speech|facial\s+droop|face\s+droop|arm\s+weakness|one\s+side\s+weakness|sudden\s+paralysis|stroke)\b", "Signs consistent with acute stroke (FAST protocol: Face, Arm, Speech, Time)"),
    (r"\b(unconscious|passed\s+out|loss\s+of\s+consciousness|blackout|syncope)\b", "Loss of consciousness or severe hemodynamic instability"),
    (r"\b(coughing\s+blood|vomiting\s+blood|throwing\s+up\s+blood|hematemesis|black\s+tarry\s+stool)\b", "Gastrointestinal or pulmonary hemorrhage"),
    (r"\b(worst\s+headache\s+of\s+my\s+life|thunderclap\s+headache|sudden\s+explosive\s+headache)\b", "Sudden severe headache warning of potential intracranial event"),
    (r"\b(stiff\s+neck\s+and\s+fever|fever\s+and\s+stiff\s+neck|meningitis)\b", "Signs suspicious for meningeal irritation"),
    (r"\b(throat\s+swelling|tongue\s+swelling|anaphylaxis|stridor|choking)\b", "Suspected anaphylaxis or acute upper airway compromise"),
    (r"\b(blue\s+lips|cyanosis|pale\s+gray\s+skin)\b", "Hypoxemia / severe oxygen desaturation warning signs")
]

PROMPT_CARE_PATTERNS = [
    (r"\bfever\s+for\s+(3|4|5|6|7|\d+)\s+days\b", "Persistent fever lasting more than 3 days"),
    (r"\b(spreading\s+rash|red\s+streaks|hot\s+red\s+skin|cellulitis)\b", "Spreading skin or soft tissue infection"),
    (r"\b(burning\s+urination\s+with\s+fever|kidney\s+pain|flank\s+pain)\b", "Urinary tract infection with possible kidney involvement"),
    (r"\b(dehydrated|unable\s+to\s+keep\s+fluids\s+down|vomiting\s+for\s+24\s+hours)\b", "Dehydration risk requiring prompt fluid evaluation"),
    (r"\b(deep\s+cut|open\s+wound|wound\s+infection|pus)\b", "Infected or deep wound requiring clinical dressing and possible antibiotic therapy")
]

ROUTINE_CARE_PATTERNS = [
    (r"\b(joint\s+pain|back\s+pain\s+for\s+months|knee\s+pain|stiffness)\b", "Chronic musculoskeletal condition"),
    (r"\b(tiredness\s+for\s+weeks|chronic\s+fatigue|lethargy\s+for\s+months)\b", "Subacute or chronic fatigue warranting general blood work"),
    (r"\b(mild\s+heartburn|acid\s+reflux\s+for\s+weeks|occasional\s+indigestion)\b", "Chronic or recurring digestive complaints"),
    (r"\b(routine\s+checkup|general\s+checkup|annual\s+health\s+screening)\b", "Preventive wellness evaluation")
]

def evaluate_emergency_rules(
    description: str,
    selected_symptoms: Optional[List[str]] = None,
    age_range: Optional[str] = None,
    severity: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    """
    Evaluates conservative clinical red flags.
    Returns structured emergency dict if triggered, None otherwise.
    """
    text = (description + " " + " ".join(selected_symptoms or [])).lower()

    # Rule 1: High severity (> 8) combined with breathing or chest or head
    if severity and severity >= 9:
        for keyword in ["chest", "breathe", "breathing", "head", "abdomen", "stomach"]:
            if keyword in text:
                return {
                    "urgency_level": UrgencyLevel.EMERGENCY_CARE,
                    "urgency_title": "Emergency Medical Attention Required",
                    "reason": f"Self-reported severity of {severity}/10 associated with {keyword} complaints warrants immediate emergency clinical evaluation.",
                    "action_required": "Call 112 (India) or 911 (US) or go to the nearest emergency department immediately. Do not drive yourself."
                }

    # Rule 2: Infant (<1 year) with fever
    if age_range in ["infant", "newborn", "<1"] and "fever" in text:
        return {
            "urgency_level": UrgencyLevel.EMERGENCY_CARE,
            "urgency_title": "Emergency Care Required (Pediatric Alert)",
            "reason": "Fever in infants (especially under 3 to 6 months) can be the only sign of serious systemic bacterial infection and requires immediate emergency department evaluation.",
            "action_required": "Take the infant to the nearest pediatric emergency department or call 112 / local emergency number without delay."
        }

    # Rule 3: Red flag regex check
    for pattern, reason in EMERGENCY_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return {
                "urgency_level": UrgencyLevel.EMERGENCY_CARE,
                "urgency_title": "Emergency Care Indicated",
                "reason": f"Safety screening identified high-risk symptoms: {reason}.",
                "action_required": "Please call 112 (India) or 911 / your local emergency number immediately, or proceed to the nearest emergency care facility. Do not wait for a routine clinic appointment."
            }

    return None

def evaluate_prompt_care_rules(description: str, selected_symptoms: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
    text = (description + " " + " ".join(selected_symptoms or [])).lower()
    for pattern, reason in PROMPT_CARE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return {
                "urgency_level": UrgencyLevel.SEE_DOCTOR_SOON,
                "urgency_title": "See a Doctor Soon (Within 24-48 Hours)",
                "reason": f"Clinical guideline alert: {reason}.",
                "action_required": "Schedule an urgent or same-day appointment with a general physician or visit an urgent care center."
            }
    return None

def evaluate_routine_rules(description: str, selected_symptoms: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
    text = (description + " " + " ".join(selected_symptoms or [])).lower()
    for pattern, reason in ROUTINE_CARE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return {
                "urgency_level": UrgencyLevel.ROUTINE_APPOINTMENT,
                "urgency_title": "Schedule a Routine Medical Appointment",
                "reason": f"Non-acute chronic or subacute symptoms: {reason}.",
                "action_required": "Book an appointment with your primary care physician at a convenient date. Keep a 7-day symptom log."
            }
    return None

