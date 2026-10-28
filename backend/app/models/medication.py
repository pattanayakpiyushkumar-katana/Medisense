import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Medication(Base):
    __tablename__ = "medications"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=True) # e.g. "500 mg"
    instructions = Column(Text, nullable=True) # e.g. "Take after breakfast with water"
    frequency_type = Column(String(50), default="daily") # "daily" or "custom"
    reminder_times = Column(Text, nullable=False, default="[\"08:00\"]") # JSON list of strings
    days_of_week = Column(Text, nullable=False, default="[\"Mon\",\"Tue\",\"Wed\",\"Thu\",\"Fri\",\"Sat\",\"Sun\"]")
    start_date = Column(String(20), nullable=False) # "YYYY-MM-DD"
    end_date = Column(String(20), nullable=True) # optional "YYYY-MM-DD"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dose_logs = relationship("DoseLog", back_populates="medication", cascade="all, delete-orphan")

class DoseLog(Base):
    __tablename__ = "dose_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    medication_id = Column(String(36), ForeignKey("medications.id", ondelete="CASCADE"), nullable=False)
    scheduled_date = Column(String(20), nullable=False) # "YYYY-MM-DD"
    scheduled_time = Column(String(10), nullable=False) # "08:00"
    status = Column(String(20), nullable=False, default="pending") # "taken", "skipped", "pending"
    action_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)

    medication = relationship("Medication", back_populates="dose_logs")

