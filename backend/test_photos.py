"""Self-check for photo attachments: run `python test_photos.py` from backend/.

Uses a throwaway sqlite DB and htpasswd file; no pytest, no fixtures.
"""
import base64
import io
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
            f"/api/{parent}/{pid}/photos",
            files=[("files", ("clip.mp4", b"fake-mp4", "video/mp4"))],
            data={"album": "front cabin"},
        ).json()
        assert more[0]["album"] == "front cabin"
        assert [p["filename"] for p in client.get(f"/api/{parent}/{pid}/photos").json()] == [
            "a.png",
            "b.png",
            "clip.mp4",
        ]
        order = [more[0]["id"], listed[1]["id"], listed[0]["id"]]
        assert client.put("/api/photos/order", json=order).status_code == 200
        assert [p["id"] for p in client.get(f"/api/{parent}/{pid}/photos").json()] == order
        assert client.put("/api/photos/order", json=[999999]).status_code == 404

        # patch single photo album
        patched = client.patch(
            f"/api/photos/{listed[1]['id']}", json={"album": "back cabin"}
        ).json()
        assert patched["album"] == "back cabin"

        # rename album batch
        res = client.put(
            f"/api/{parent}/{pid}/photos/albums",
            json={"old_name": "front cabin", "new_name": "forward cabin"},
        )
        assert res.status_code == 200
        assert client.get(f"/api/photos/{more[0]['id']}").status_code == 200
        after_rename = client.get(f"/api/{parent}/{pid}/photos").json()
        photo_by_id = {p["id"]: p for p in after_rename}
        assert photo_by_id[more[0]["id"]]["album"] == "forward cabin"
        assert photo_by_id[listed[1]["id"]]["album"] == "back cabin"
        assert photo_by_id[listed[0]["id"]]["album"] is None

        # test single photo download with disposition=attachment
        dl = client.get(f"/api/photos/{more[0]['id']}?download=true")
        assert dl.status_code == 200
        assert "attachment" in dl.headers["content-disposition"]
        inline = client.get(f"/api/photos/{more[0]['id']}")
        assert "inline" in inline.headers["content-disposition"]

        # test multi-photo zip download for parent
        zip_res = client.get(f"/api/{parent}/{pid}/photos/download")
        assert zip_res.status_code == 200
        assert zip_res.headers["content-type"] == "application/zip"
        import zipfile
        with zipfile.ZipFile(io.BytesIO(zip_res.content)) as zf:
            assert len(zf.namelist()) == 3
            assert "clip.mp4" in zf.namelist()

        # test album-filtered zip download
        album_res = client.get(f"/api/{parent}/{pid}/photos/download?album=forward%20cabin")
        assert album_res.status_code == 200
        with zipfile.ZipFile(io.BytesIO(album_res.content)) as zf:
            assert zf.namelist() == ["clip.mp4"]

        # test multi-photo zip download by ids
        ids_param = f"{listed[1]['id']},{more[0]['id']}"
        by_ids = client.get(f"/api/photos/download?ids={ids_param}")
        assert by_ids.status_code == 200
        with zipfile.ZipFile(io.BytesIO(by_ids.content)) as zf:
            assert len(zf.namelist()) == 2

        assert client.delete(f"/api/photos/{listed[0]['id']}").status_code == 200
        assert len(client.get(f"/api/{parent}/{pid}/photos").json()) == 2

    # photos must not leak between parents, and must die with their parent
    assert client.get(f"/api/logbook/{voyage['id']}/photos").json()[0]["filename"] == "clip.mp4"
    counted = client.get(f"/api/boats/{boat['id']}/logbook").json()[0]
    assert counted["photo_count"] == 2, counted
    assert client.get(f"/api/boats/{boat['id']}/maintenance").json()[0]["photo_count"] == 2
    client.delete(f"/api/logbook/{voyage['id']}")
    assert client.get(f"/api/logbook/{voyage['id']}/photos").json() == []

    # delete attachment checks
    doc = client.post(
        f"/api/boats/{boat['id']}/documents",
        data={"title": "Doc with file"},
        files=[("files", ("test.pdf", b"pdf-content", "application/pdf"))],
    ).json()
    assert doc["filename"] == "test.pdf"
    del_doc_file = client.delete(f"/api/documents/{doc['id']}/file").json()
    assert del_doc_file["filename"] is None

    todo = client.post(
        f"/api/boats/{boat['id']}/todos",
        data={"text": "Todo with file"},
        files=[("files", ("todo.pdf", b"pdf-content", "application/pdf"))],
    ).json()
    assert todo["file_filename"] == "todo.pdf"
    del_todo_file = client.delete(f"/api/todos/{todo['id']}/file").json()
    assert del_todo_file["file_filename"] is None

    # update with remove_file=True
    maint_with_rcpt = client.post(
        f"/api/boats/{boat['id']}/maintenance",
        data={"title": "Oil", "date": "2024-06-01"},
        files=[("files", ("receipt.pdf", b"rcpt", "application/pdf"))],
    ).json()
    assert maint_with_rcpt["receipt_filename"] == "receipt.pdf"
    updated_maint = client.put(
        f"/api/maintenance/{maint_with_rcpt['id']}",
        data={"title": "Oil", "date": "2024-06-01", "remove_file": "true"},
    ).json()
    assert updated_maint["receipt_filename"] is None

    # unauthenticated image links are rejected
    assert TestClient(app).get("/api/photos/1").status_code == 401
    print("ok")


if __name__ == "__main__":
    demo()
