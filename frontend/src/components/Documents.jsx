import { useEffect, useRef, useState } from "react";
import { api, openFile } from "../api.js";
import { formatDateTime } from "../format.js";
import DetailModal from "./DetailModal.jsx";
import Markdown from "./Markdown.jsx";

export default function Documents({ boatId }) {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const editFileRef = useRef();

  async function load(q = search) {
    setDocs(await api.listDocuments(boatId, q));
  }

  useEffect(() => {
    load("");
  }, [boatId]);

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  async function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api.createDocument(boatId, {
        title: title.trim(),
        description: description.trim(),
        file: fileRef.current?.files[0] || null,
      });
      setTitle("");
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(doc) {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    await api.deleteDocument(doc.id);
    load();
  }

  function openEdit(doc) {
    setEditing(doc);
    setEditTitle(doc.title);
    setEditDescription(doc.description || "");
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    await api.updateDocument(editing.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      file: editFileRef.current?.files[0] || null,
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <form onSubmit={add} style={{ marginBottom: 16 }}>
        <div className="field">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Document file (optional)</label>
          <input ref={fileRef} type="file" />
        </div>
        <button type="submit" disabled={busy}>
          Add entry
        </button>
      </form>

      <div className="field">
        <input
          type="text"
          value={search}
          placeholder="🔍 Search documents…"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {docs.length === 0 && (
        <div className="empty">
          {search ? "No matching documents." : "No documents yet."}
        </div>
      )}

      {docs.map((d) => (
        <div key={d.id} className="list-item">
          <span className="txt grow clickable" onClick={() => openEdit(d)}>
            <strong>{d.title}</strong>
          </span>
          <button className="danger" onClick={() => remove(d)}>
            ✕
          </button>
        </div>
      ))}

      {editing && (
        <DetailModal
          title={editing.title}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          view={
            <>
              <Markdown text={editing.description} />
              {editing.filename && (
                <p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openFile(`/api/documents/${editing.id}/download`);
                    }}
                  >
                    📄 {editing.filename}
                  </a>
                </p>
              )}
              <div className="muted">Added {formatDateTime(editing.uploaded_at)}</div>
            </>
          }
          edit={
            <>
              <div className="field">
                <label>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  autoFocus
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div className="field">
                <label>
                  {editing.filename
                    ? `Replace file (current: ${editing.filename})`
                    : "Attach a file (optional)"}
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
