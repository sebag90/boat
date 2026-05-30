import { useEffect, useState } from "react";
import { api } from "../api.js";
import DetailModal from "./DetailModal.jsx";
import Markdown from "./Markdown.jsx";

const EMPTY = { name: "", description: "", link: "" };

export default function Shopping({ boatId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);

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
    });
    setForm(EMPTY);
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
  }

  async function saveEdit() {
    if (!editForm.name.trim()) return;
    await api.updateShopping(editing.id, {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      link: editForm.link.trim(),
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <form onSubmit={add} style={{ marginBottom: 16 }}>
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
        <button type="submit">Add item</button>
      </form>

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
            </>
          }
        />
      )}
    </div>
  );
}
