from typing import List, Optional, Any
from fastapi import APIRouter, HTTPException, Query
from ..schemas.medicine import MedicineSearchItem, MedicineDetail, AmbiguityGuidance
from ..services.medicine_service import search_medicines, get_medicine_by_id, check_ambiguity, load_verified_medicines

router = APIRouter(prefix="/api/medicines", tags=["Medicine Information"])

@router.get("/search")
def search_medicines_endpoint(q: str = Query(..., min_length=1, description="Brand name, generic, or active ingredient")):
    # Step 1: Check ambiguity
    ambiguity = check_ambiguity(q)
    if ambiguity:
        return {
            "is_ambiguous": True,
            "guidance": ambiguity,
            "results": []
        }

    # Step 2: Search catalog
    items = search_medicines(q)
    return {
        "is_ambiguous": False,
        "guidance": None,
        "results": items
    }

@router.get("/all", response_model=List[MedicineSearchItem])
def get_all_medicines():
    data = load_verified_medicines()
    return [
        MedicineSearchItem(
            id=m["id"],
            name=m["name"],
            active_ingredient=m["active_ingredient"],
            brand_names=m["brand_names"],
            category=m["category"],
            strengths_common=m["strengths_common"]
        )
        for m in data
    ]

@router.get("/{identifier}", response_model=MedicineDetail)
def get_medicine_detail(identifier: str):
    med = get_medicine_by_id(identifier)
    if not med:
        raise HTTPException(
            status_code=404,
            detail=f"Medicine '{identifier}' not found in the verified clinical catalog. Please verify spelling or search by active ingredient."
        )
    return med

