import { useEffect, useState } from "react";
import { api } from "../api.js";
import DetailModal from "./DetailModal.jsx";
import Markdown from "./Markdown.jsx";

export default function Checklist({ kind, boatId, placeholder }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");

  async function load() {
    setItems(await api.listItems(kind, boatId));
  }

  useEffect(() => {
    load();
  }, [kind, boatId]);

  async function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await api.addItem(kind, boatId, text.trim());
    setText("");
    load();
  }

  async function toggle(item) {
    await api.updateItem(kind, item.id, { done: !item.done });
    load();
  }

  async function remove(item) {
    await api.deleteItem(kind, item.id);
    load();
  }

  function openEdit(item) {
    setEditing(item);
    setEditText(item.text);
  }

  async function saveEdit() {
    if (!editText.trim()) return;
    await api.updateItem(kind, editing.id, { text: editText.trim() });
    setEditing(null);
    load();
  }

  return (
    <div>
      <form className="row" onSubmit={add} style={{ marginBottom: 12 }}>
        <input
          className="grow"
          type="text"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {items.length === 0 && <div className="empty">Nothing here yet.</div>}

      {items.map((item) => (
        <div key={item.id} className={"list-item" + (item.done ? " done" : "")}>
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggle(item)}
          />
          <span className="txt grow clickable" onClick={() => openEdit(item)}>
            {item.text}
          </span>
          <button className="danger" onClick={() => remove(item)}>
            ✕
          </button>
        </div>
      ))}

      {editing && (
        <DetailModal
          title={editing.text}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          view={<Markdown text={editing.text} />}
          edit={
            <div className="field">
              <label>Text</label>
              <input
                type="text"
                value={editText}
                autoFocus
                onChange={(e) => setEditText(e.target.value)}
              />
            </div>
          }
        />
      )}
    </div>
  );
}
