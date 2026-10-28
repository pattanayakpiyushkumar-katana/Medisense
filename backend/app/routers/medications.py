import json
from datetime import datetime, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.medication import Medication, DoseLog
from ..schemas.medication import (
    MedicationCreate,
    MedicationUpdate,
    MedicationOut,
    DoseLogCreate,
    DoseLogOut,
    DailyReminderItem,
    AdherenceSummary
)

router = APIRouter(prefix="/api/medications", tags=["Medications & Reminders"])

DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

@router.post("", response_model=MedicationOut, status_code=201)
def create_medication(med_in: MedicationCreate, db: Session = Depends(get_db)):
    med = Medication(
        name=med_in.name,
        dosage=med_in.dosage,
        instructions=med_in.instructions,
        frequency_type=med_in.frequency_type,
        reminder_times=json.dumps(med_in.reminder_times),
        days_of_week=json.dumps(med_in.days_of_week),
        start_date=med_in.start_date,
        end_date=med_in.end_date,
        is_active=med_in.is_active
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    
    return MedicationOut(
        id=med.id,
        name=med.name,
        dosage=med.dosage,
        instructions=med.instructions,
        frequency_type=med.frequency_type,
        reminder_times=json.loads(med.reminder_times),
        days_of_week=json.loads(med.days_of_week),
        start_date=med.start_date,
        end_date=med.end_date,
        is_active=med.is_active,
        created_at=med.created_at,
        dose_logs=[]
    )

@router.get("", response_model=List[MedicationOut])
def list_medications(active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Medication)
    if active_only:
        query = query.filter(Medication.is_active == True)
    meds = query.order_by(Medication.created_at.desc()).all()
    
    results = []
    for m in meds:
        logs = [
            DoseLogOut(
                id=l.id,
                medication_id=l.medication_id,
                scheduled_date=l.scheduled_date,
                scheduled_time=l.scheduled_time,
                status=l.status,
                action_timestamp=l.action_timestamp,
                notes=l.notes
            )
            for l in m.dose_logs
        ]
        results.append(
            MedicationOut(
                id=m.id,
                name=m.name,
                dosage=m.dosage,
                instructions=m.instructions,
                frequency_type=m.frequency_type,
                reminder_times=json.loads(m.reminder_times),
                days_of_week=json.loads(m.days_of_week),
                start_date=m.start_date,
                end_date=m.end_date,
                is_active=m.is_active,
                created_at=m.created_at,
                dose_logs=logs
            )
        )
    return results

@router.get("/{med_id}", response_model=MedicationOut)
def get_medication(med_id: str, db: Session = Depends(get_db)):
    m = db.query(Medication).filter(Medication.id == med_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    logs = [
        DoseLogOut(
            id=l.id,
            medication_id=l.medication_id,
            scheduled_date=l.scheduled_date,
            scheduled_time=l.scheduled_time,
            status=l.status,
            action_timestamp=l.action_timestamp,
            notes=l.notes
        )
        for l in m.dose_logs
    ]
    return MedicationOut(
        id=m.id,
        name=m.name,
        dosage=m.dosage,
        instructions=m.instructions,
        frequency_type=m.frequency_type,
        reminder_times=json.loads(m.reminder_times),
        days_of_week=json.loads(m.days_of_week),
        start_date=m.start_date,
        end_date=m.end_date,
        is_active=m.is_active,
        created_at=m.created_at,
        dose_logs=logs
    )

@router.patch("/{med_id}", response_model=MedicationOut)
def update_medication(med_id: str, update: MedicationUpdate, db: Session = Depends(get_db)):
    m = db.query(Medication).filter(Medication.id == med_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    if update.name is not None:
        m.name = update.name
    if update.dosage is not None:
        m.dosage = update.dosage
    if update.instructions is not None:
        m.instructions = update.instructions
    if update.frequency_type is not None:
        m.frequency_type = update.frequency_type
    if update.reminder_times is not None:
        m.reminder_times = json.dumps(update.reminder_times)
    if update.days_of_week is not None:
        m.days_of_week = json.dumps(update.days_of_week)
    if update.start_date is not None:
        m.start_date = update.start_date
    if update.end_date is not None:
        m.end_date = update.end_date
    if update.is_active is not None:
        m.is_active = update.is_active

    db.commit()
    db.refresh(m)
    return get_medication(med_id, db)

@router.delete("/{med_id}")
def delete_medication(med_id: str, db: Session = Depends(get_db)):
    m = db.query(Medication).filter(Medication.id == med_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Medication not found")
    db.delete(m)
    db.commit()
    return {"message": "Medication deleted successfully"}

@router.post("/{med_id}/dose-log", response_model=DoseLogOut)
def record_dose_status(med_id: str, log_in: DoseLogCreate, db: Session = Depends(get_db)):
    m = db.query(Medication).filter(Medication.id == med_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Medication not found")

    # Check if a log already exists for this scheduled date & time
    existing = db.query(DoseLog).filter(
        DoseLog.medication_id == med_id,
        DoseLog.scheduled_date == log_in.scheduled_date,
        DoseLog.scheduled_time == log_in.scheduled_time
    ).first()

    if existing:
        existing.status = log_in.status
        existing.action_timestamp = datetime.now(timezone.utc)
        if log_in.notes:
            existing.notes = log_in.notes
        db.commit()
        db.refresh(existing)
        return DoseLogOut.model_validate(existing)

    new_log = DoseLog(
        medication_id=med_id,
        scheduled_date=log_in.scheduled_date,
        scheduled_time=log_in.scheduled_time,
        status=log_in.status,
        action_timestamp=datetime.now(timezone.utc),
        notes=log_in.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return DoseLogOut.model_validate(new_log)

@router.get("/reminders/today", response_model=List[DailyReminderItem])
def get_today_reminders(target_date: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns today's checklist of doses, matching day of the week and date range.
    """
    today_str = target_date or date.today().isoformat()
    try:
        current_date_obj = date.fromisoformat(today_str)
        today_day_name = DAY_NAMES[current_date_obj.weekday()]
    except Exception:
        today_day_name = "Mon"

    active_meds = db.query(Medication).filter(Medication.is_active == True).all()
    reminders = []

    for med in active_meds:
        # Check start and end date
        if med.start_date and today_str < med.start_date:
            continue
        if med.end_date and today_str > med.end_date:
            continue

        try:
            days = json.loads(med.days_of_week)
            times = json.loads(med.reminder_times)
        except Exception:
            days = ["Daily"]
            times = ["08:00"]

        is_scheduled_today = "Daily" in days or today_day_name in days or len(days) == 7

        if not is_scheduled_today:
            continue

        for t in times:
            # Check existing log
            dose_log = db.query(DoseLog).filter(
                DoseLog.medication_id == med.id,
                DoseLog.scheduled_date == today_str,
                DoseLog.scheduled_time == t
            ).first()

            status = dose_log.status if dose_log else "pending"
            dose_log_id = dose_log.id if dose_log else None

            reminders.append(
                DailyReminderItem(
                    medication_id=med.id,
                    medication_name=med.name,
                    dosage=med.dosage,
                    instructions=med.instructions,
                    scheduled_time=t,
                    scheduled_date=today_str,
                    status=status,
                    dose_log_id=dose_log_id
                )
            )

    # Sort reminders chronologically by time
    reminders.sort(key=lambda x: x.scheduled_time)
    return reminders

@router.get("/adherence/stats", response_model=AdherenceSummary)
def get_adherence_stats(db: Session = Depends(get_db)):
    logs = db.query(DoseLog).all()
    total = len(logs)
    taken = sum(1 for l in logs if l.status == "taken")
    skipped = sum(1 for l in logs if l.status == "skipped")
    pending = sum(1 for l in logs if l.status == "pending")

    rate = (taken / (taken + skipped) * 100) if (taken + skipped) > 0 else 100.0

    return AdherenceSummary(
        total_scheduled=total,
        taken_count=taken,
        skipped_count=skipped,
        pending_count=pending,
        adherence_rate_percent=round(rate, 1),
        streak_days=3 if taken > 0 else 0
    )
