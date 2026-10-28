from typing import List
from pydantic import BaseModel

class ConditionPrecaution(BaseModel):
    id: str
    name: str
    category: str
    overview: str
    general_precautions: List[str]
    warning_signs: List[str]
    lifestyle_considerations: List[str]
    medication_cautions: List[str]
    when_to_seek_care: str
    questions_to_ask_doctor: List[str]

