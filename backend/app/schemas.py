from datetime import datetime, date

from pydantic import BaseModel


class BoatCreate(BaseModel):
    name: str
    description: str = ""


class BoatOut(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentOut(BaseModel):
    id: int
    title: str
    description: str
    filename: str | None
    content_type: str | None
    uploaded_at: datetime

    class Config:
        from_attributes = True


class PhotoOut(BaseModel):
    id: int
    album: str | None = None
    filename: str
    content_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class PhotoUpdate(BaseModel):
    album: str | None = None


class AlbumRename(BaseModel):
    old_name: str
    new_name: str


class MaintenanceOut(BaseModel):
    id: int
    title: str
    date: date
    description: str
    receipt_filename: str | None
    created_at: datetime
    photo_count: int = 0

    class Config:
        from_attributes = True


class WaypointCreate(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime | None = None
    name: str | None = None


class WaypointOut(BaseModel):
    id: int
    log_id: int
    latitude: float
    longitude: float
    timestamp: datetime
    name: str | None = None

    class Config:
        from_attributes = True


class LogCreate(BaseModel):
    date: date
    crew: str = ""
    start: str = ""
    goal: str = ""
    description: str = ""
    waypoints: list[WaypointCreate] = []


class LogOut(BaseModel):
    id: int
    date: date
    crew: str
    start: str
    goal: str
    description: str
    created_at: datetime
    photo_count: int = 0
    waypoints: list[WaypointOut] = []

    class Config:
        from_attributes = True


class ItemCreate(BaseModel):
    text: str


class ItemUpdate(BaseModel):
    text: str | None = None
    done: bool | None = None


class ItemOut(BaseModel):
    id: int
    text: str
    done: bool
    file_filename: str | None = None
    file_content_type: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ShoppingCreate(BaseModel):
    name: str
    description: str = ""
    link: str = ""


class ShoppingUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    link: str | None = None
    done: bool | None = None


class ShoppingOut(BaseModel):
    id: int
    name: str
    description: str
    link: str
    done: bool
    file_filename: str | None = None
    file_content_type: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
