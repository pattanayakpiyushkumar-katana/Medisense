import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.assessment import SymptomAssessmentRecord, DoctorSummaryRecord
from ..schemas.symptom import SymptomAnalysisRequest, SymptomAnalysisResponse
from ..schemas.doctor_summary import DoctorSummaryRequest, DoctorSummaryResponse
from ..services.symptom_analyzer import analyze_symptoms
from ..services.doctor_summary_gen import generate_doctor_summary

router = APIRouter(prefix="/api/symptoms", tags=["Symptoms & Triage"])

@router.post("/analyze", response_model=SymptomAnalysisResponse)
def analyze_symptoms_endpoint(req: SymptomAnalysisRequest, db: Session = Depends(get_db)):
    result = analyze_symptoms(req)
    
    # Save record to local database for user dashboard history
    try:
        record = SymptomAssessmentRecord(
            urgency_level=result.urgency_level.value,
            summary_text=result.urgency_explanation,
            user_description=req.description,
            data_json=result.model_dump_json()
        )
        db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()
        # Non-fatal if DB write fails, return clinical analysis
    
    return result

@router.post("/doctor-summary", response_model=DoctorSummaryResponse)
def create_doctor_summary_endpoint(req: DoctorSummaryRequest, db: Session = Depends(get_db)):
    result = generate_doctor_summary(req)
    
    try:
        record = DoctorSummaryRecord(
            id=result.id,
            main_concern=result.main_concern,
            patient_script=result.patient_speaking_script,
            full_summary_json=result.model_dump_json()
        )
        db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()

    return result

@router.get("/history")
def get_symptom_history(db: Session = Depends(get_db)):
    records = db.query(SymptomAssessmentRecord).order_by(SymptomAssessmentRecord.created_at.desc()).limit(10).all()
    results = []
    for r in records:
        try:
            parsed = json.loads(r.data_json)
        except Exception:
            parsed = {}
        results.append({
            "id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "urgency_level": r.urgency_level,
            "summary_text": r.summary_text,
            "user_description": r.user_description,
            "details": parsed
        })
    return results

