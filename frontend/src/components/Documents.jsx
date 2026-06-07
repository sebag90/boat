import { useEffect, useRef, useState } from "react";
import { api, authedFileUrl } from "../api.js";
import { formatDateTime } from "../format.js";
import DetailModal from "./DetailModal.jsx";
import Dropzone from "./Dropzone.jsx";
import Markdown from "./Markdown.jsx";

export default function Documents({ boatId }) {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);

  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState(null);

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
        file: file,
      });
      setTitle("");
      setDescription("");
      setFile(null);
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
    setEditFile(null);
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    await api.updateDocument(editing.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      file: editFile,
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <div className="form-section">
        <h3>Add New Document</h3>
        <form onSubmit={add}>
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
            <Dropzone onFileSelected={setFile} currentFilename={file?.name} />
          </div>
          <button type="submit" disabled={busy}>
            Add entry
          </button>
        </form>
      </div>

      <div className="list-section">
        <h3>Documents</h3>
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
      </div>

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
                    href={authedFileUrl(`/api/documents/${editing.id}/download`)}
                    target="_blank"
                    rel="noreferrer"
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
                <label>Document file (optional)</label>
                <Dropzone
                  onFileSelected={setEditFile}
                  currentFilename={editFile?.name || editing.filename}
                />
              </div>
            </>
          }
        />
      )}
    </div>
  );
}
