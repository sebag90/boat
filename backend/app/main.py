import io
from datetime import date

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
    title: str = Form(...),
    description: str = Form(""),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    get_boat(boat_id, db)
    doc = models.Document(boat_id=boat_id, title=title, description=description)
    if file is not None:
        doc.data = await file.read()
        doc.filename = file.filename or "file"
        doc.content_type = file.content_type or "application/octet-stream"
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


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
    db: Session = Depends(get_db),
):
    get_boat(boat_id, db)
    record = models.Maintenance(
        boat_id=boat_id, title=title, date=date, description=description
    )
    if receipt is not None:
        record.receipt_data = await receipt.read()
        record.receipt_filename = receipt.filename
        record.receipt_content_type = receipt.content_type or "application/octet-stream"
    db.add(record)
    db.commit()
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
def add_todo(boat_id: int, payload: schemas.ItemCreate, db: Session = Depends(get_db)):
    return _add_item(models.Todo, boat_id, payload, db)


@app.put("/api/todos/{item_id}", response_model=schemas.ItemOut)
def update_todo(item_id: int, payload: schemas.ItemUpdate, db: Session = Depends(get_db)):
    return _update_item(models.Todo, item_id, payload, db)


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
def add_shopping(boat_id: int, payload: schemas.ShoppingCreate, db: Session = Depends(get_db)):
    get_boat(boat_id, db)
    item = models.ShoppingItem(
        boat_id=boat_id,
        name=payload.name,
        description=payload.description,
        link=payload.link,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/shopping/{item_id}", response_model=schemas.ShoppingOut)
def update_shopping(item_id: int, payload: schemas.ShoppingUpdate, db: Session = Depends(get_db)):
    item = db.get(models.ShoppingItem, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    if payload.name is not None:
        item.name = payload.name
    if payload.description is not None:
        item.description = payload.description
    if payload.link is not None:
        item.link = payload.link
    if payload.done is not None:
        item.done = payload.done
    db.commit()
    db.refresh(item)
    return item


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
    entry = models.LogEntry(boat_id=boat_id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.put("/api/logbook/{entry_id}", response_model=schemas.LogOut)
def update_log(entry_id: int, payload: schemas.LogCreate, db: Session = Depends(get_db)):
    entry = db.get(models.LogEntry, entry_id)
    if not entry:
        raise HTTPException(404, "Entry not found")
    for key, value in payload.model_dump().items():
        setattr(entry, key, value)
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


@app.get("/api/health")
def health():
    return {"status": "ok"}
