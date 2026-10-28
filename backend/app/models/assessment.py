import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from ..database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SymptomAssessmentRecord(Base):
    __tablename__ = "symptom_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    urgency_level = Column(String(50), nullable=False)
    summary_text = Column(Text, nullable=False)
    user_description = Column(Text, nullable=False)
    data_json = Column(Text, nullable=False)

class DoctorSummaryRecord(Base):
    __tablename__ = "doctor_summaries"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    main_concern = Column(String(300), nullable=False)
    patient_script = Column(Text, nullable=False)
    full_summary_json = Column(Text, nullable=False)

