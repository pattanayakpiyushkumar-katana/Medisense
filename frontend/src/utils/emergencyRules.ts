export interface QuickEmergencyDetection {
  isEmergency: boolean;
  title: string;
  reason: string;
  action: string;
}

const EMERGENCY_REGEXES = [
  {
    regex: /\b(crushing|radiating|tight|pressure)\s+(chest\s+pain|chest)\b/i,
    title: 'Severe Chest Pressure / Suspected Cardiac Event',
    reason: 'Crushing chest pain or pressure radiating to the arm, neck, or jaw can indicate an acute heart attack.'
  },
  {
    regex: /\b(chest\s+pain)\b/i,
    title: 'Chest Pain Alert',
    reason: 'Sudden or unexplained chest pain warrants immediate clinical exclusion of acute cardiac emergency.'
  },
  {
    regex: /\b(can'?t\s+breathe|severe\s+difficulty\s+breathing|gasping|suffocating)\b/i,
    title: 'Acute Respiratory Distress',
    reason: 'Severe difficulty breathing is a life-threatening symptom requiring emergency medical assessment.'
  },
  {
    regex: /\b(slurred\s+speech|facial\s+droop|face\s+droop|one\s+side\s+weakness|stroke)\b/i,
    title: 'Possible Stroke Alert (FAST Protocol)',
    reason: 'Sudden weakness on one side of the body, facial droop, or slurred speech requires immediate emergency care.'
  },
  {
    regex: /\b(unconscious|passed\s+out|blackout|syncope)\b/i,
    title: 'Loss of Consciousness',
    reason: 'Fainting or loss of responsiveness must be evaluated in an emergency department.'
  },
  {
    regex: /\b(coughing\s+blood|vomiting\s+blood|throwing\s+up\s+blood)\b/i,
    title: 'Acute Hemorrhage / Bleeding',
    reason: 'Coughing or vomiting blood requires emergency medical intervention.'
  },
  {
    regex: /\b(worst\s+headache|thunderclap\s+headache)\b/i,
    title: 'Sudden Severe Headache',
    reason: 'Sudden explosive headache reaching peak severity in seconds can signal intracranial bleeding.'
  },
  {
    regex: /\b(throat\s+swelling|tongue\s+swelling|anaphylaxis|stridor)\b/i,
    title: 'Severe Allergic Reaction / Anaphylaxis',
    reason: 'Swelling of the throat, lips, or tongue blocking the airway is an immediate life threat.'
  }
];

export function detectInstantEmergency(text: string): QuickEmergencyDetection | null {
  if (!text || text.trim().length < 5) return null;

  for (const rule of EMERGENCY_REGEXES) {
    if (rule.regex.test(text)) {
      return {
        isEmergency: true,
        title: rule.title,
        reason: rule.reason,
        action: 'Call 112 (India) or 911 (US/Canada) or visit your nearest emergency room immediately.'
      };
    }
  }

  return null;
}

