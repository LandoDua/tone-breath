from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register():
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "user_id" in data


def test_login():
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_create_session():
    response = client.post(
        "/sessions/",
        json={
            "routine_type": "coherent",
            "duration_seconds": 300,
            "started_at": "2026-01-01T00:00:00Z",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["routine_type"] == "coherent"


def test_create_emotion():
    response = client.post(
        "/emotions/",
        json={
            "type": "before",
            "dimensions": {
                "calma": 5,
                "ansiedad": 7,
                "energia": 4,
                "tristeza": 3,
                "enfoque": 6,
                "apertura": 5,
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dominant_emotion"] == "ansiedad"
