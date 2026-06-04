import { useEffect, useRef, useState } from "react";
import { api, authedFileUrl } from "../api.js";
import { formatDate } from "../format.js";
import DetailModal from "./DetailModal.jsx";
import Markdown from "./Markdown.jsx";

export default function Maintenance({ boatId }) {
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const editFileRef = useRef();

  async function load() {
    setRecords(await api.listMaintenance(boatId));
  }

  useEffect(() => {
    load();
  }, [boatId]);

  async function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api.addMaintenance(boatId, {
        title: title.trim(),
        date,
        description: description.trim(),
        receipt: fileRef.current?.files[0] || null,
      });
      setTitle("");
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(rec) {
    if (!confirm("Delete this maintenance entry?")) return;
    await api.deleteMaintenance(rec.id);
    load();
  }

  function openEdit(rec) {
    setEditing(rec);
    setEditTitle(rec.title || "");
    setEditDate(String(rec.date).slice(0, 10));
    setEditDescription(rec.description || "");
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    await api.updateMaintenance(editing.id, {
      title: editTitle.trim(),
      date: editDate,
      description: editDescription.trim(),
      receipt: editFileRef.current?.files[0] || null,
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <div className="form-section">
        <h3>Add New Maintenance Entry</h3>
        <form onSubmit={add}>
          <div className="field">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Description of the job done</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Receipt (optional)</label>
            <input ref={fileRef} type="file" />
          </div>
          <button type="submit" disabled={busy}>
            Add entry
          </button>
        </form>
      </div>

      <div className="list-section">
        <h3>Maintenance History</h3>
        {records.length === 0 && <div className="empty">No maintenance history yet.</div>}

        {records.map((r) => (
          <div key={r.id} className="list-item">
            <span className="txt grow clickable" onClick={() => openEdit(r)}>
              <span className="muted">{formatDate(r.date)} — </span>
              <strong>{r.title || "Untitled"}</strong>
            </span>
            <button className="danger" onClick={() => remove(r)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <DetailModal
          title={`${formatDate(editing.date)} — ${editing.title || "Untitled"}`}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          view={
            <>
              <Markdown text={editing.description} />
              {editing.receipt_filename && (
                <p>
                  <a
                    href={authedFileUrl(`/api/maintenance/${editing.id}/receipt`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🧾 {editing.receipt_filename}
                  </a>
                </p>
              )}
            </>
          }
          edit={
            <>
              <div className="field">
                <label>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Description of the job done</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div className="field">
                <label>
                  {editing.receipt_filename
                    ? `Replace receipt (current: ${editing.receipt_filename})`
                    : "Attach a receipt (optional)"}
                </label>
                <input ref={editFileRef} type="file" />
              </div>
            </>
          }
        />
      )}
    </div>
  );
}
