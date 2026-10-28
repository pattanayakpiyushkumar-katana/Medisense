from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class MedicationBase(BaseModel):
    name: str = Field(..., min_length=1)
    dosage: Optional[str] = None
    instructions: Optional[str] = None
    frequency_type: str = "daily"
    reminder_times: List[str] = Field(default_factory=lambda: ["08:00"])
    days_of_week: List[str] = Field(default_factory=lambda: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
    start_date: str
    end_date: Optional[str] = None
    is_active: bool = True

class MedicationCreate(MedicationBase):
    pass

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    instructions: Optional[str] = None
    frequency_type: Optional[str] = None
    reminder_times: Optional[List[str]] = None
    days_of_week: Optional[List[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: Optional[bool] = None

class DoseLogCreate(BaseModel):
    scheduled_date: str
    scheduled_time: str
    status: str = Field(..., pattern="^(taken|skipped|pending)$")
    notes: Optional[str] = None

class DoseLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    medication_id: str
    scheduled_date: str
    scheduled_time: str
    status: str
    action_timestamp: datetime
    notes: Optional[str] = None

class MedicationOut(MedicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    dose_logs: List[DoseLogOut] = Field(default_factory=list)

class DailyReminderItem(BaseModel):
    medication_id: str
    medication_name: str
    dosage: Optional[str] = None
    instructions: Optional[str] = None
    scheduled_time: str
    scheduled_date: str
    status: str # "taken", "skipped", "pending"
    dose_log_id: Optional[str] = None

class AdherenceSummary(BaseModel):
    total_scheduled: int
    taken_count: int
    skipped_count: int
    pending_count: int
    adherence_rate_percent: float
    streak_days: int

