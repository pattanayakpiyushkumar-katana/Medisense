from typing import List
from fastapi import APIRouter, HTTPException
from ..schemas.health import ConditionPrecaution
from ..services.condition_service import get_all_conditions, get_condition_by_id

router = APIRouter(prefix="/api/health", tags=["Health & Chronic Disease Guides"])

@router.get("/conditions", response_model=List[ConditionPrecaution])
def list_conditions():
    return get_all_conditions()

@router.get("/conditions/{condition_id}", response_model=ConditionPrecaution)
def get_condition_detail(condition_id: str):
    cond = get_condition_by_id(condition_id)
    if not cond:
        raise HTTPException(status_code=404, detail="Condition guide not found")
    return cond

