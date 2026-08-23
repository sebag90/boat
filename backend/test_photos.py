"""Self-check for photo attachments: run `python test_photos.py` from backend/.

Uses a throwaway sqlite DB and htpasswd file; no pytest, no fixtures.
"""
import base64
import os
import tempfile

tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{tmp}/test.db"
os.environ["HTPASSWD_FILE"] = f"{tmp}/htpasswd"
from passlib.apache import HtpasswdFile  # noqa: E402

ht = HtpasswdFile(os.environ["HTPASSWD_FILE"], new=True)
ht.set_password("skipper", "secret")
ht.save()

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)
client.headers["Authorization"] = "Basic " + base64.b64encode(b"skipper:secret").decode()

PNG = bytes.fromhex("89504e470d0a1a0a")


def demo():
    boat = client.post("/api/boats", json={"name": "Sirena"}).json()
    record = client.post(
        f"/api/boats/{boat['id']}/maintenance",
        data={"title": "Winch service", "date": "2024-05-01"},
    ).json()
    voyage = client.post(f"/api/boats/{boat['id']}/logbook", json={"date": "2024-05-02"}).json()
    assert voyage["photo_count"] == 0 and record["photo_count"] == 0

    for parent, pid in (("maintenance", record["id"]), ("logbook", voyage["id"])):
        files = [("files", ("a.png", PNG, "image/png")), ("files", ("b.png", PNG, "image/png"))]
        created = client.post(f"/api/{parent}/{pid}/photos", files=files).json()
        assert len(created) == 2, created

        listed = client.get(f"/api/{parent}/{pid}/photos").json()
        assert [p["filename"] for p in listed] == ["a.png", "b.png"], listed

        raw = client.get(f"/api/photos/{listed[0]['id']}")
        assert raw.content == PNG and raw.headers["content-type"] == "image/png"

        # a later upload (e.g. video) lands last; an explicit reorder sticks
        more = client.post(
            f"/api/{parent}/{pid}/photos", files=[("files", ("clip.mp4", b"fake-mp4", "video/mp4"))]
        ).json()
        assert [p["filename"] for p in client.get(f"/api/{parent}/{pid}/photos").json()] == [
            "a.png",
            "b.png",
            "clip.mp4",
        ]
        order = [more[0]["id"], listed[1]["id"], listed[0]["id"]]
        assert client.put("/api/photos/order", json=order).status_code == 200
        assert [p["id"] for p in client.get(f"/api/{parent}/{pid}/photos").json()] == order
        assert client.put("/api/photos/order", json=[999999]).status_code == 404

        assert client.delete(f"/api/photos/{listed[0]['id']}").status_code == 200
        assert len(client.get(f"/api/{parent}/{pid}/photos").json()) == 2

    # photos must not leak between parents, and must die with their parent
    assert client.get(f"/api/logbook/{voyage['id']}/photos").json()[0]["filename"] == "clip.mp4"
    counted = client.get(f"/api/boats/{boat['id']}/logbook").json()[0]
    assert counted["photo_count"] == 2, counted
    assert client.get(f"/api/boats/{boat['id']}/maintenance").json()[0]["photo_count"] == 2
    client.delete(f"/api/logbook/{voyage['id']}")
    assert client.get(f"/api/logbook/{voyage['id']}/photos").json() == []

    # unauthenticated image links are rejected
    assert TestClient(app).get("/api/photos/1").status_code == 401
    print("ok")


if __name__ == "__main__":
    demo()
