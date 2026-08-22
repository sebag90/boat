import io
from datetime import date, datetime

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
from .auth import require_auth
from . import models, schemas


def _init_db(retries: int = 30, delay: float = 2.0):
    import time

    for attempt in range(retries):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except Exception as exc:  # noqa: BLE001
            if attempt == retries - 1:
                raise
            print(f"DB not ready ({exc}); retrying in {delay}s...")
            time.sleep(delay)


_init_db()

# ponytail: no migration tool in this project; one idempotent DDL nudge for the
# `photos.position` column added after the table shipped. Move to Alembic if a
# second schema change like this shows up.
try:
    with engine.begin() as _conn:
        from sqlalchemy import text as _text

        _conn.execute(_text("ALTER TABLE photos ADD COLUMN position INTEGER DEFAULT 0"))
except Exception:
    pass

app = FastAPI(title="Boat Organizer", dependencies=[Depends(require_auth)])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/me")
def me(user: str = Depends(require_auth)):
    return {"username": user}


def get_boat(boat_id: int, db: Session) -> models.Boat:
    boat = db.get(models.Boat, boat_id)
    if not boat:
        raise HTTPException(404, "Boat not found")
    return boat


# ---------- Boats ----------
@app.get("/api/boats", response_model=list[schemas.BoatOut])
def list_boats(db: Session = Depends(get_db)):
    return db.query(models.Boat).order_by(models.Boat.name).all()


@app.post("/api/boats", response_model=schemas.BoatOut)
def create_boat(payload: schemas.BoatCreate, db: Session = Depends(get_db)):
    boat = models.Boat(name=payload.name, description=payload.description)
    db.add(boat)
    db.commit()
    db.refresh(boat)
    return boat


@app.get("/api/boats/{boat_id}", response_model=schemas.BoatOut)
def read_boat(boat_id: int, db: Session = Depends(get_db)):
    return get_boat(boat_id, db)


@app.put("/api/boats/{boat_id}", response_model=schemas.BoatOut)
def update_boat(boat_id: int, payload: schemas.BoatCreate, db: Session = Depends(get_db)):
    boat = get_boat(boat_id, db)
    boat.name = payload.name
    boat.description = payload.description
    db.commit()
    db.refresh(boat)
    return boat


@app.delete("/api/boats/{boat_id}")
def delete_boat(boat_id: int, db: Session = Depends(get_db)):
    boat = get_boat(boat_id, db)
    db.delete(boat)
    db.commit()
    return {"ok": True}


# ---------- Documents ----------
@app.get("/api/boats/{boat_id}/documents", response_model=list[schemas.DocumentOut])
def list_documents(boat_id: int, q: str | None = None, db: Session = Depends(get_db)):
    get_boat(boat_id, db)
    query = db.query(models.Document).filter_by(boat_id=boat_id)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            models.Document.title.ilike(like)
            | models.Document.description.ilike(like)
            | models.Document.filename.ilike(like)
        )
    return query.order_by(models.Document.uploaded_at.desc()).all()


@app.post("/api/boats/{boat_id}/documents", response_model=schemas.DocumentOut)
async def create_document(
    boat_id: int,
    title: str = Form(""),
    description: str = Form(""),
    file: UploadFile | None = File(None),
    files: list[UploadFile] | None = File(None),
    db: Session = Depends(get_db),
):
    get_boat(boat_id, db)
    all_files: list[UploadFile] = []
    if files:
        all_files.extend(files)
    if file is not None and file not in all_files and file.filename:
        all_files.append(file)

    if not all_files:
        doc = models.Document(boat_id=boat_id, title=title or "Untitled Document", description=description)
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    created_docs = []
    for idx, f in enumerate(all_files):
        doc_title = title if title else (f.filename or f"Document {idx + 1}")
        if len(all_files) > 1 and title and idx > 0:
            doc_title = f"{title} ({idx + 1})"
        doc = models.Document(
            boat_id=boat_id,
            title=doc_title,
            description=description,
            data=await f.read(),
            filename=f.filename or "file",
            content_type=f.content_type or "application/octet-stream",
        )
        db.add(doc)
        created_docs.append(doc)

    db.commit()
    for doc in created_docs:
        db.refresh(doc)
    return created_docs[0]


@app.get("/api/documents/{doc_id}/download")
def download_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.get(models.Document, doc_id)
    if not doc or not doc.data:
        raise HTTPException(404, "Document file not found")
    return StreamingResponse(
        io.BytesIO(doc.data),
        media_type=doc.content_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{doc.filename}"'},
    )


@app.put("/api/documents/{doc_id}", response_model=schemas.DocumentOut)
async def update_document(
    doc_id: int,
    title: str = Form(...),
    description: str = Form(""),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    doc = db.get(models.Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    doc.title = title
    doc.description = description
    if file is not None:
        doc.data = await file.read()
        doc.filename = file.filename or "file"
        doc.content_type = file.content_type or "application/octet-stream"
    db.commit()
    db.refresh(doc)
    return doc


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.get(models.Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    db.delete(doc)
    db.commit()
    return {"ok": True}


# ---------- Maintenance ----------
@app.get("/api/boats/{boat_id}/maintenance", response_model=list[schemas.MaintenanceOut])
def list_maintenance(boat_id: int, db: Session = Depends(get_db)):
    get_boat(boat_id, db)
    return (
        db.query(models.Maintenance)
        .filter_by(boat_id=boat_id)
        .order_by(models.Maintenance.date.desc())
        .all()
    )


@app.post("/api/boats/{boat_id}/maintenance", response_model=schemas.MaintenanceOut)
async def add_maintenance(
    boat_id: int,
    title: str = Form(""),
    date: date = Form(...),
    description: str = Form(""),
    receipt: UploadFile | None = File(None),
    files: list[UploadFile] | None = File(None),
    db: Session = Depends(get_db),
):
    get_boat(boat_id, db)
    all_files: list[UploadFile] = []
    if files:
        all_files.extend(files)
    if receipt is not None and receipt not in all_files and receipt.filename:
        all_files.append(receipt)

    if not all_files:
        record = models.Maintenance(
            boat_id=boat_id, title=title, date=date, description=description
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    created_records = []
    for idx, f in enumerate(all_files):
        rec_title = title if title else (f.filename or f"Service Job {idx + 1}")
        if len(all_files) > 1 and title and idx > 0:
            rec_title = f"{title} ({idx + 1})"
        record = models.Maintenance(
            boat_id=boat_id,
            title=rec_title,
            date=date,
            description=description,
            receipt_data=await f.read(),
            receipt_filename=f.filename or "file",
            receipt_content_type=f.content_type or "application/octet-stream",
        )
        db.add(record)
        created_records.append(record)

    db.commit()
    for r in created_records:
        db.refresh(r)
    return created_records[0]
    db.refresh(record)
    return record


@app.put("/api/maintenance/{record_id}", response_model=schemas.MaintenanceOut)
async def update_maintenance(
    record_id: int,
    title: str = Form(""),
    date: date = Form(...),
    description: str = Form(""),
    receipt: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    record = db.get(models.Maintenance, record_id)
    if not record:
        raise HTTPException(404, "Record not found")
    record.title = title
    record.date = date
    record.description = description
    if receipt is not None:
        record.receipt_data = await receipt.read()
        record.receipt_filename = receipt.filename
        record.receipt_content_type = receipt.content_type or "application/octet-stream"
    db.commit()
    db.refresh(record)
    return record


@app.get("/api/maintenance/{record_id}/receipt")
def download_receipt(record_id: int, db: Session = Depends(get_db)):
    record = db.get(models.Maintenance, record_id)
    if not record or not record.receipt_data:
        raise HTTPException(404, "Receipt not found")
    return StreamingResponse(
        io.BytesIO(record.receipt_data),
        media_type=record.receipt_content_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{record.receipt_filename}"'},
    )


@app.delete("/api/maintenance/{record_id}")
def delete_maintenance(record_id: int, db: Session = Depends(get_db)):
    record = db.get(models.Maintenance, record_id)
    if not record:
        raise HTTPException(404, "Record not found")
    db.delete(record)
    db.commit()
    return {"ok": True}


# ---------- Photos (maintenance records / voyages) ----------
async def _add_photos(db: Session, files: list[UploadFile], **parent: int) -> list[models.Photo]:
    start = db.query(models.Photo).filter_by(**parent).count()
    photos = [
        models.Photo(
            **parent,
            position=start + idx,
            data=await f.read(),
            filename=f.filename or "photo",
            content_type=f.content_type or "application/octet-stream",
        )
        for idx, f in enumerate(f for f in files if f.filename)
    ]
    db.add_all(photos)
    db.commit()
    for photo in photos:
        db.refresh(photo)
    return photos


def _list_photos(db: Session, **parent: int) -> list[models.Photo]:
    return (
        db.query(models.Photo)
        .filter_by(**parent)
        .order_by(models.Photo.position, models.Photo.id)
        .all()
    )


@app.post("/api/maintenance/{record_id}/photos", response_model=list[schemas.PhotoOut])
async def add_maintenance_photos(
    record_id: int, files: list[UploadFile] = File(...), db: Session = Depends(get_db)
):
    if not db.get(models.Maintenance, record_id):
        raise HTTPException(404, "Record not found")
    return await _add_photos(db, files, maintenance_id=record_id)


@app.get("/api/maintenance/{record_id}/photos", response_model=list[schemas.PhotoOut])
def list_maintenance_photos(record_id: int, db: Session = Depends(get_db)):
    return _list_photos(db, maintenance_id=record_id)


@app.post("/api/logbook/{entry_id}/photos", response_model=list[schemas.PhotoOut])
async def add_log_photos(
    entry_id: int, files: list[UploadFile] = File(...), db: Session = Depends(get_db)
):
    if not db.get(models.LogEntry, entry_id):
        raise HTTPException(404, "Log entry not found")
    return await _add_photos(db, files, log_id=entry_id)


@app.get("/api/logbook/{entry_id}/photos", response_model=list[schemas.PhotoOut])
def list_log_photos(entry_id: int, db: Session = Depends(get_db)):
    return _list_photos(db, log_id=entry_id)


@app.put("/api/photos/order")
def reorder_photos(ids: list[int], db: Session = Depends(get_db)):
    """Body is the photo ids in their new display order."""
    for index, photo_id in enumerate(ids):
        photo = db.get(models.Photo, photo_id)
        if not photo:
            raise HTTPException(404, f"Photo {photo_id} not found")
        photo.position = index
    db.commit()
    return {"ok": True}


@app.get("/api/photos/{photo_id}")
def download_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.get(models.Photo, photo_id)
    if not photo:
        raise HTTPException(404, "Photo not found")
    return StreamingResponse(
        io.BytesIO(photo.data),
        media_type=photo.content_type,
        headers={"Content-Disposition": f'inline; filename="{photo.filename}"'},
    )


@app.delete("/api/photos/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.get(models.Photo, photo_id)
    if not photo:
        raise HTTPException(404, "Photo not found")
    db.delete(photo)
    db.commit()
    return {"ok": True}


# ---------- Generic list helpers (todo / shopping) ----------
def _list_items(model, boat_id, db):
    get_boat(boat_id, db)
    return (
        db.query(model)
        .filter_by(boat_id=boat_id)
        .order_by(model.done, model.created_at.desc())
        .all()
    )


def _add_item(model, boat_id, payload, db):
    get_boat(boat_id, db)
    item = model(boat_id=boat_id, text=payload.text)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _update_item(model, item_id, payload, db):
    item = db.get(model, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    if payload.text is not None:
        item.text = payload.text
    if payload.done is not None:
        item.done = payload.done
    db.commit()
    db.refresh(item)
    return item


def _delete_item(model, item_id, db):
    item = db.get(model, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


# ---------- Todos ----------
@app.get("/api/boats/{boat_id}/todos", response_model=list[schemas.ItemOut])
def list_todos(boat_id: int, db: Session = Depends(get_db)):
    return _list_items(models.Todo, boat_id, db)


@app.post("/api/boats/{boat_id}/todos", response_model=schemas.ItemOut)
async def add_todo(
    boat_id: int,
    text: str = Form(...),
    file: UploadFile | None = File(None),
    files: list[UploadFile] | None = File(None),
    db: Session = Depends(get_db)
):
    get_boat(boat_id, db)
    all_files: list[UploadFile] = []
    if files:
        all_files.extend(files)
    if file is not None and file not in all_files and file.filename:
        all_files.append(file)

    if not all_files:
        item = models.Todo(boat_id=boat_id, text=text)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    created_todos = []
    for idx, f in enumerate(all_files):
        todo_text = text if text else (f.filename or f"Task {idx + 1}")
        if len(all_files) > 1 and text and idx > 0:
            todo_text = f"{text} ({idx + 1})"
        item = models.Todo(
            boat_id=boat_id,
            text=todo_text,
            file_data=await f.read(),
            file_filename=f.filename or "file",
            file_content_type=f.content_type or "application/octet-stream",
        )
        db.add(item)
        created_todos.append(item)

    db.commit()
    for t in created_todos:
        db.refresh(t)
    return created_todos[0]
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/todos/{item_id}", response_model=schemas.ItemOut)
async def update_todo(
    item_id: int,
    text: str | None = Form(None),
    done: bool | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    item = db.get(models.Todo, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    if text is not None:
        item.text = text
    if done is not None:
        item.done = done
    if file is not None:
        item.file_data = await file.read()
        item.file_filename = file.filename
        item.file_content_type = file.content_type or "application/octet-stream"
    db.commit()
    db.refresh(item)
    return item


@app.get("/api/todos/{item_id}/file")
def download_todo_file(item_id: int, db: Session = Depends(get_db)):
    item = db.get(models.Todo, item_id)
    if not item or not item.file_data:
        raise HTTPException(404, "File not found")
    return StreamingResponse(
        io.BytesIO(item.file_data),
        media_type=item.file_content_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{item.file_filename}"'},
    )


@app.delete("/api/todos/{item_id}")
def delete_todo(item_id: int, db: Session = Depends(get_db)):
    return _delete_item(models.Todo, item_id, db)


# ---------- Shopping ----------
@app.get("/api/boats/{boat_id}/shopping", response_model=list[schemas.ShoppingOut])
def list_shopping(boat_id: int, db: Session = Depends(get_db)):
    get_boat(boat_id, db)
    return (
        db.query(models.ShoppingItem)
        .filter_by(boat_id=boat_id)
        .order_by(models.ShoppingItem.done, models.ShoppingItem.created_at.desc())
        .all()
    )


@app.post("/api/boats/{boat_id}/shopping", response_model=schemas.ShoppingOut)
async def add_shopping(
    boat_id: int,
    name: str = Form(...),
    description: str = Form(""),
    link: str = Form(""),
    file: UploadFile | None = File(None),
    files: list[UploadFile] | None = File(None),
    db: Session = Depends(get_db)
):
    get_boat(boat_id, db)
    all_files: list[UploadFile] = []
    if files:
        all_files.extend(files)
    if file is not None and file not in all_files and file.filename:
        all_files.append(file)

    if not all_files:
        item = models.ShoppingItem(
            boat_id=boat_id,
            name=name,
            description=description,
            link=link,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    created_items = []
    for idx, f in enumerate(all_files):
        item_name = name if name else (f.filename or f"Item {idx + 1}")
        if len(all_files) > 1 and name and idx > 0:
            item_name = f"{name} ({idx + 1})"
        item = models.ShoppingItem(
            boat_id=boat_id,
            name=item_name,
            description=description,
            link=link,
            file_data=await f.read(),
            file_filename=f.filename or "file",
            file_content_type=f.content_type or "application/octet-stream",
        )
        db.add(item)
        created_items.append(item)

    db.commit()
    for i in created_items:
        db.refresh(i)
    return created_items[0]
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/shopping/{item_id}", response_model=schemas.ShoppingOut)
async def update_shopping(
    item_id: int,
    name: str | None = Form(None),
    description: str | None = Form(None),
    link: str | None = Form(None),
    done: bool | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    item = db.get(models.ShoppingItem, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    if name is not None:
        item.name = name
    if description is not None:
        item.description = description
    if link is not None:
        item.link = link
    if done is not None:
        item.done = done
    if file is not None:
        item.file_data = await file.read()
        item.file_filename = file.filename
        item.file_content_type = file.content_type or "application/octet-stream"
    db.commit()
    db.refresh(item)
    return item


@app.get("/api/shopping/{item_id}/file")
def download_shopping_file(item_id: int, db: Session = Depends(get_db)):
    item = db.get(models.ShoppingItem, item_id)
    if not item or not item.file_data:
        raise HTTPException(404, "File not found")
    return StreamingResponse(
        io.BytesIO(item.file_data),
        media_type=item.file_content_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{item.file_filename}"'},
    )


@app.delete("/api/shopping/{item_id}")
def delete_shopping(item_id: int, db: Session = Depends(get_db)):
    return _delete_item(models.ShoppingItem, item_id, db)


# ---------- Log book ----------
@app.get("/api/boats/{boat_id}/logbook", response_model=list[schemas.LogOut])
def list_logbook(boat_id: int, db: Session = Depends(get_db)):
    get_boat(boat_id, db)
    return (
        db.query(models.LogEntry)
        .filter_by(boat_id=boat_id)
        .order_by(models.LogEntry.date.desc())
        .all()
    )


@app.post("/api/boats/{boat_id}/logbook", response_model=schemas.LogOut)
def add_log(boat_id: int, payload: schemas.LogCreate, db: Session = Depends(get_db)):
    get_boat(boat_id, db)
    data = payload.model_dump(exclude={"waypoints"})
    entry = models.LogEntry(boat_id=boat_id, **data)
    for wp in payload.waypoints:
        ts = wp.timestamp if wp.timestamp else datetime.now()
        entry.waypoints.append(
            models.Waypoint(
                latitude=wp.latitude,
                longitude=wp.longitude,
                timestamp=ts,
                name=wp.name,
            )
        )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.put("/api/logbook/{entry_id}", response_model=schemas.LogOut)
def update_log(entry_id: int, payload: schemas.LogCreate, db: Session = Depends(get_db)):
    entry = db.get(models.LogEntry, entry_id)
    if not entry:
        raise HTTPException(404, "Entry not found")
    data = payload.model_dump(exclude={"waypoints"})
    for key, value in data.items():
        setattr(entry, key, value)
    
    if payload.waypoints is not None:
        entry.waypoints.clear()
        for wp in payload.waypoints:
            ts = wp.timestamp if wp.timestamp else datetime.now()
            entry.waypoints.append(
                models.Waypoint(
                    latitude=wp.latitude,
                    longitude=wp.longitude,
                    timestamp=ts,
                    name=wp.name,
                )
            )
    db.commit()
    db.refresh(entry)
    return entry


@app.delete("/api/logbook/{entry_id}")
def delete_log(entry_id: int, db: Session = Depends(get_db)):
    entry = db.get(models.LogEntry, entry_id)
    if not entry:
        raise HTTPException(404, "Entry not found")
    db.delete(entry)
    db.commit()
    return {"ok": True}


@app.post("/api/logbook/{entry_id}/waypoints", response_model=schemas.WaypointOut)
def add_waypoint(
    entry_id: int, payload: schemas.WaypointCreate, db: Session = Depends(get_db)
):
    entry = db.get(models.LogEntry, entry_id)
    if not entry:
        raise HTTPException(404, "Log entry not found")
    ts = payload.timestamp if payload.timestamp else datetime.now()
    wp = models.Waypoint(
        log_id=entry_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        timestamp=ts,
        name=payload.name,
    )
    db.add(wp)
    db.commit()
    db.refresh(wp)
    return wp


@app.post("/api/logbook/{entry_id}/waypoints/import", response_model=list[schemas.WaypointOut])
def import_waypoints(
    entry_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)
):
    entry = db.get(models.LogEntry, entry_id)
    if not entry:
        raise HTTPException(404, "Log entry not found")

    content = file.file.read().decode("utf-8", errors="ignore")
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    imported_wps = []

    for line in lines:
        lat, lon, ts_str, name = None, None, None, None
        if line.startswith("{") and line.endswith("}"):
            try:
                import json
                data = json.loads(line)
                lat = float(data.get("latitude") if data.get("latitude") is not None else data.get("lat"))
                lon = float(data.get("longitude") if data.get("longitude") is not None else data.get("lon") if data.get("lon") is not None else data.get("lng"))
                name = data.get("name")
                if data.get("timestamp") or data.get("time"):
                    ts_str = str(data.get("timestamp") or data.get("time"))
            except Exception:
                continue
        else:
            if "latitude" in line.lower() or "lat" in line.lower():
                continue
            parts = [p.strip() for p in (line.split("\t") if "\t" in line else line.split(",")) if p.strip()]
            if len(parts) < 2:
                continue
            try:
                lat = float(parts[0])
                lon = float(parts[1])
            except ValueError:
                continue
            if len(parts) >= 3:
                ts_str = parts[2]

        if lat is not None and lon is not None:
            ts = datetime.now()
            if ts_str:
                try:
                    ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                except Exception:
                    ts = datetime.now()

            wp = models.Waypoint(
                log_id=entry_id,
                latitude=lat,
                longitude=lon,
                timestamp=ts,
                name=name,
            )
            db.add(wp)
            imported_wps.append(wp)

    db.commit()
    for wp in imported_wps:
        db.refresh(wp)
    return imported_wps


@app.delete("/api/waypoints/{waypoint_id}")
def delete_waypoint(waypoint_id: int, db: Session = Depends(get_db)):
    wp = db.get(models.Waypoint, waypoint_id)
    if not wp:
        raise HTTPException(404, "Waypoint not found")
    db.delete(wp)
    db.commit()
    return {"ok": True}


@app.get("/api/health")
def health():
    return {"status": "ok"}
