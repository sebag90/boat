import { useEffect, useState } from "react";
import { api, authedFileUrl } from "../api.js";
import DetailModal from "./DetailModal.jsx";
import Dropzone from "./Dropzone.jsx";
import Markdown from "./Markdown.jsx";

const EMPTY = { name: "", description: "", link: "" };

export default function Shopping({ boatId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [editFile, setEditFile] = useState(null);

  async function load() {
    setItems(await api.listShopping(boatId));
  }

  useEffect(() => {
    load();
  }, [boatId]);

  async function add(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await api.addShopping(boatId, {
      name: form.name.trim(),
      description: form.description.trim(),
      link: form.link.trim(),
      file: file,
    });
    setForm(EMPTY);
    setFile(null);
    load();
  }

  async function toggle(item) {
    await api.updateShopping(item.id, { done: !item.done });
    load();
  }

  async function remove(item) {
    await api.deleteShopping(item.id);
    load();
  }

  function openEdit(item) {
    setEditing(item);
    setEditForm({ name: item.name, description: item.description, link: item.link });
    setEditFile(null);
  }

  async function saveEdit() {
    if (!editForm.name.trim()) return;
    await api.updateShopping(editing.id, {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      link: editForm.link.trim(),
      file: editFile,
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <div className="form-section">
        <h3>Add Shopping Item</h3>
        <form onSubmit={add}>
          <div className="field">
            <label>Item name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Link (optional)</label>
            <input
              type="text"
              value={form.link}
              placeholder="https://…"
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </div>
          <div className="field">
            <label>File (optional)</label>
            <Dropzone onFileSelected={setFile} currentFilename={file?.name} />
          </div>
          <button type="submit">Add item</button>
        </form>
      </div>

      <div className="list-section">
        <h3>Shopping List</h3>
        {items.length === 0 && <div className="empty">Shopping list is empty.</div>}

        {items.map((item) => (
          <div key={item.id} className={"list-item" + (item.done ? " done" : "")}>
            <input type="checkbox" checked={item.done} onChange={() => toggle(item)} />
            <span className="txt grow clickable" onClick={() => openEdit(item)}>
              <strong>{item.name}</strong>
            </span>
            <button className="danger" onClick={() => remove(item)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <DetailModal
          title={editing.name}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          view={
            <>
              <Markdown text={editing.description} />
              {editing.link && (
                <p>
                  <a href={editing.link} target="_blank" rel="noreferrer">
                    🔗 {editing.link}
                  </a>
                </p>
              )}
              {editing.file_filename && (
                <div style={{ marginTop: "10px" }}>
                  <a
                    href={authedFileUrl(`/api/shopping/${editing.id}/file`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📄 {editing.file_filename}
                  </a>
                </div>
              )}
            </>
          }
          edit={
            <>
              <div className="field">
                <label>Item name</label>
                <input
                  type="text"
                  value={editForm.name}
                  autoFocus
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>Link (optional)</label>
                <input
                  type="text"
                  value={editForm.link}
                  onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Replace File</label>
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
