import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_for_activity():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Remove if already present
    client.delete(f"/activities/{activity}/participants/{email}")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json().get("message", "")
    # Try duplicate signup
    response2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert response2.status_code == 400
    # Clean up
    client.delete(f"/activities/{activity}/participants/{email}")

def test_remove_participant():
    email = "removeuser@mergington.edu"
    activity = "Programming Class"
    # Add user first
    client.post(f"/activities/{activity}/signup?email={email}")
    response = client.delete(f"/activities/{activity}/participants/{email}")
    assert response.status_code == 204
    # Try removing again
    response2 = client.delete(f"/activities/{activity}/participants/{email}")
    assert response2.status_code == 404
