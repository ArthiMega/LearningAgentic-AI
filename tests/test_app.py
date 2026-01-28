import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Volleyball" in data

def test_signup_and_unregister():
    activity = "Volleyball"
    email = "pytestuser@school.edu"

    # Ensure not already registered
    client.post(f"/activities/{activity}/unregister", json={"email": email})

    # Signup
    resp_signup = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp_signup.status_code == 200
    assert f"Signed up {email}" in resp_signup.json()["message"]

    # Duplicate signup should fail
    resp_dup = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp_dup.status_code == 400

    # Unregister
    resp_unreg = client.post(f"/activities/{activity}/unregister", json={"email": email})
    assert resp_unreg.status_code == 200
    assert f"Unregistered {email}" in resp_unreg.json()["message"]

    # Unregister again should fail
    resp_unreg2 = client.post(f"/activities/{activity}/unregister", json={"email": email})
    assert resp_unreg2.status_code == 400
