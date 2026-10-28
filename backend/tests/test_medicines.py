from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_search_verified_medicine():
    response = client.get("/api/medicines/search?q=Paracetamol")
    assert response.status_code == 200
    data = response.json()
    assert data["is_ambiguous"] is False
    assert len(data["results"]) > 0
    first = data["results"][0]
    assert "Paracetamol" in first["name"]

def test_search_ambiguous_keyword_triggers_guidance():
    response = client.get("/api/medicines/search?q=painkiller")
    assert response.status_code == 200
    data = response.json()
    assert data["is_ambiguous"] is True
    assert data["guidance"] is not None
    assert "active ingredient" in data["guidance"]["prompt_for_user"].lower()

def test_get_medicine_details():
    response = client.get("/api/medicines/paracetamol")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Paracetamol"
    assert "how_it_works_simple" in data
    assert len(data["common_side_effects"]) > 0
    assert len(data["serious_warning_signs"]) > 0
    assert len(data["important_precautions"]) > 0
    assert len(data["sources"]) > 0
    assert "last_checked_date" in data

def test_unknown_medicine_returns_404():
    response = client.get("/api/medicines/nonexistent_drug_xyz123")
    assert response.status_code == 404

