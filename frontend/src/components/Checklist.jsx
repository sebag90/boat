import { useEffect, useState } from "react";
import { api, authedFileUrl } from "../api.js";
import DetailModal from "./DetailModal.jsx";
import Dropzone from "./Dropzone.jsx";

export default function Checklist({ kind, boatId, placeholder }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editFile, setEditFile] = useState(null);

  async function load() {
    setItems(await api.listItems(kind, boatId));
  }

  useEffect(() => {
    load();
  }, [kind, boatId]);

  async function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await api.addItem(kind, boatId, { text: text.trim(), file });
    setText("");
    setFile(null);
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
    setEditFile(null);
  }

  async function saveEdit() {
    if (!editText.trim()) return;
    await api.updateItem(kind, editing.id, { text: editText.trim(), file: editFile });
    setEditing(null);
    load();
  }

  return (
    <div>
      <div className="form-section">
        <h3>Add New Item</h3>
        <form onSubmit={add}>
          <div className="row">
            <input
              className="grow"
              type="text"
              value={text}
              placeholder={placeholder}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Add</button>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <Dropzone onFileSelected={setFile} currentFilename={file?.name} />
          </div>
        </form>
      </div>

      <div className="list-section">
        <h3>To-Do List</h3>
        {items.length === 0 && <div className="empty">Nothing here yet.</div>}

        {items.map((item) => (
          <div key={item.id} className={"list-item" + (item.done ? " done" : "")}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(item)}
            />
            <span className="txt grow clickable" onClick={() => openEdit(item)}>
              <strong>{item.text}</strong>
            </span>
            <button className="danger" onClick={() => remove(item)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <DetailModal
          title={editing.text}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          view={
            <div>
              <Markdown text={editing.text} />
              {editing.file_filename && (
                <div style={{ marginTop: "10px" }}>
                  <a
                    href={authedFileUrl(`/api/${kind}/${editing.id}/file`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📄 {editing.file_filename}
                  </a>
                </div>
              )}
            </div>
          }
          edit={
            <>
              <div className="field">
                <label>Text</label>
                <input
                  type="text"
                  value={editText}
                  autoFocus
                  onChange={(e) => setEditText(e.target.value)}
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
