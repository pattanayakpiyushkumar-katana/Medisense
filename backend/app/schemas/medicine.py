from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class MedicineSearchItem(BaseModel):
    id: str
    name: str
    active_ingredient: str
    brand_names: List[str]
    category: str
    strengths_common: List[str]

class MedicineDetail(BaseModel):
    id: str
    name: str
    active_ingredient: str
    brand_names: List[str]
    category: str
    strengths_common: List[str]
    common_uses: List[str]
    how_it_works_simple: str
    common_side_effects: List[str]
    serious_warning_signs: List[str]
    important_precautions: List[str]
    contraindications_and_interactions: List[str]
    food_instructions: str
    storage_info: str
    special_considerations: Dict[str, str]
    questions_to_ask_doctor: List[str]
    sources: List[str]
    last_checked_date: str
    safety_notice: str = (
        "Educational drug information only. Never start, stop, or adjust prescription doses without "
        "consulting your physician or pharmacist. Always refer to your product label."
    )

class AmbiguityGuidance(BaseModel):
    is_ambiguous: bool
    query: str
    explanation: str
    prompt_for_user: str
    suggested_matches: List[MedicineSearchItem] = Field(default_factory=list)

