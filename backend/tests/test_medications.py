from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_medication_crud_and_reminders():
    # 1. Create a medication
    payload = {
        "name": "Metformin",
        "dosage": "500 mg",
        "instructions": "Take with dinner",
        "frequency_type": "daily",
        "reminder_times": ["08:00", "20:00"],
        "days_of_week": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "start_date": "2026-10-01",
        "is_active": True
    }
    create_res = client.post("/api/medications", json=payload)
    assert create_res.status_code == 201
    med = create_res.json()
    med_id = med["id"]
    assert med["name"] == "Metformin"
    assert len(med["reminder_times"]) == 2

    # 2. List medications
    list_res = client.get("/api/medications")
    assert list_res.status_code == 200
    all_meds = list_res.json()
    assert any(m["id"] == med_id for m in all_meds)

    # 3. Log a dose as 'taken'
    dose_payload = {
        "scheduled_date": "2026-10-29",
        "scheduled_time": "08:00",
        "status": "taken",
        "notes": "Taken with a glass of water"
    }
    dose_res = client.post(f"/api/medications/{med_id}/dose-log", json=dose_payload)
    assert dose_res.status_code == 200
    dose_data = dose_res.json()
    assert dose_data["status"] == "taken"

    # 4. Check today's reminders checklist
    today_res = client.get("/api/medications/reminders/today?target_date=2026-10-29")
    assert today_res.status_code == 200
    reminders = today_res.json()
    match = next((r for r in reminders if r["medication_id"] == med_id and r["scheduled_time"] == "08:00"), None)
    assert match is not None
    assert match["status"] == "taken"

    # 5. Check adherence stats
    adherence_res = client.get("/api/medications/adherence/stats")
    assert adherence_res.status_code == 200
    stats = adherence_res.json()
    assert stats["taken_count"] >= 1

    # 6. Delete medication
    del_res = client.delete(f"/api/medications/{med_id}")
    assert del_res.status_code == 200

