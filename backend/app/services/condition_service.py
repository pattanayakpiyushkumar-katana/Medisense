import json
import os
from typing import List, Optional
from ..schemas.health import ConditionPrecaution

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "health_conditions.json")

def load_conditions() -> List[dict]:
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def get_all_conditions() -> List[ConditionPrecaution]:
    data = load_conditions()
    return [ConditionPrecaution(**item) for item in data]

def get_condition_by_id(condition_id: str) -> Optional[ConditionPrecaution]:
    data = load_conditions()
    target = condition_id.strip().lower()
    for item in data:
        if item["id"].lower() == target or target in item["name"].lower():
            return ConditionPrecaution(**item)
    return None

