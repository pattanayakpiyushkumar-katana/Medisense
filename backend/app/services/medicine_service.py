import json
import os
from typing import List, Optional, Tuple
from ..schemas.medicine import MedicineSearchItem, MedicineDetail, AmbiguityGuidance

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "verified_medicines.json")

# Ambiguous query categories
AMBIGUOUS_KEYWORDS = {
    "painkiller": "Painkillers belong to several distinct drug classes (e.g. Paracetamol, NSAIDs like Ibuprofen, or prescription opioids), each with very different safety precautions and contraindications.",
    "pain medicine": "There are different types of pain medications. Some (like Paracetamol) act centrally, while others (NSAIDs like Ibuprofen) affect stomach and kidneys.",
    "antibiotic": "Antibiotics are targeted toward specific bacterial strains and require an accurate prescription and sensitivity culture. Taking the wrong antibiotic or wrong dose causes severe complications.",
    "cold medicine": "Most over-the-counter cold medicines are multi-ingredient formulations containing combinations of decongestants, antihistamines, and paracetamol.",
    "fever tablet": "Fever reducers typically contain paracetamol or ibuprofen, which have different dosage ceilings and pediatric guidelines.",
    "cough syrup": "Cough syrups differ greatly between expectorants (for wet cough) and suppressants (for dry cough), and may contain sedating ingredients.",
    "sleeping pill": "Sleep aids vary from antihistamines to controlled prescription hypnotics and require careful psychiatric/medical evaluation."
}

def load_verified_medicines() -> List[dict]:
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def check_ambiguity(query: str) -> Optional[AmbiguityGuidance]:
    q = query.strip().lower()
    for kw, expl in AMBIGUOUS_KEYWORDS.items():
        if q == kw or q in kw:
            medicines = load_verified_medicines()
            matches = [
                MedicineSearchItem(
                    id=m["id"],
                    name=m["name"],
                    active_ingredient=m["active_ingredient"],
                    brand_names=m["brand_names"],
                    category=m["category"],
                    strengths_common=m["strengths_common"]
                )
                for m in medicines[:4]
            ]
            return AmbiguityGuidance(
                is_ambiguous=True,
                query=query,
                explanation=expl,
                prompt_for_user="Please specify the exact active ingredient, brand name, or dosage strength printed on your medicine strip/box.",
                suggested_matches=matches
            )
    return None

def search_medicines(query: str) -> List[MedicineSearchItem]:
    medicines = load_verified_medicines()
    q = query.strip().lower()
    results = []

    for m in medicines:
        name_match = q in m["name"].lower()
        active_match = q in m["active_ingredient"].lower()
        brand_match = any(q in b.lower() for b in m["brand_names"])
        category_match = q in m.get("category", "").lower()

        if name_match or active_match or brand_match or category_match:
            results.append(
                MedicineSearchItem(
                    id=m["id"],
                    name=m["name"],
                    active_ingredient=m["active_ingredient"],
                    brand_names=m["brand_names"],
                    category=m["category"],
                    strengths_common=m["strengths_common"]
                )
            )

    return results

def get_medicine_by_id(med_id: str) -> Optional[MedicineDetail]:
    medicines = load_verified_medicines()
    target = med_id.strip().lower()
    for m in medicines:
        if m["id"].lower() == target or m["name"].lower() == target:
            return MedicineDetail(**m)
        for b in m.get("brand_names", []):
            if b.lower() == target or target in b.lower():
                return MedicineDetail(**m)
    return None

