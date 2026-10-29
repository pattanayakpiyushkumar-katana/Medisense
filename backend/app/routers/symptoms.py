import json
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.assessment import SymptomAssessmentRecord, DoctorSummaryRecord
from ..schemas.symptom import SymptomAnalysisRequest, SymptomAnalysisResponse
from ..schemas.doctor_summary import DoctorSummaryRequest, DoctorSummaryResponse
from ..services.symptom_analyzer import analyze_symptoms
from ..services.doctor_summary_gen import generate_doctor_summary
from ..services.ollama_service import (
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaTimeoutError,
    OllamaResponseError,
    OllamaServiceError
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/symptoms", tags=["Symptoms & Triage"])

@router.post("/analyze", response_model=SymptomAnalysisResponse)
def analyze_symptoms_endpoint(req: SymptomAnalysisRequest, db: Session = Depends(get_db)):
    try:
        result = analyze_symptoms(req)
    except (OllamaConnectionError, OllamaModelNotFoundError) as err:
        logger.warning(f"Ollama availability issue: {err}")
        raise HTTPException(status_code=503, detail=str(err))
    except OllamaTimeoutError as err:
        logger.warning(f"Ollama inference timeout: {err}")
        raise HTTPException(status_code=504, detail=str(err))
    except (OllamaResponseError, OllamaServiceError) as err:
        logger.error(f"Ollama processing error: {err}")
        raise HTTPException(status_code=502, detail=str(err))
    except Exception as err:
        logger.exception("Unexpected error during symptom analysis")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during symptom analysis. Please try again or seek emergency care if you feel unwell."
        )
    
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
    try:
        result = generate_doctor_summary(req)
    except (OllamaConnectionError, OllamaModelNotFoundError) as err:
        logger.warning(f"Ollama availability issue: {err}")
        raise HTTPException(status_code=503, detail=str(err))
    except OllamaTimeoutError as err:
        logger.warning(f"Ollama inference timeout: {err}")
        raise HTTPException(status_code=504, detail=str(err))
    except (OllamaResponseError, OllamaServiceError) as err:
        logger.error(f"Ollama processing error: {err}")
        raise HTTPException(status_code=502, detail=str(err))
    except Exception as err:
        logger.exception("Unexpected error during doctor summary generation")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while preparing your doctor summary. Please try again."
        )
    
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
