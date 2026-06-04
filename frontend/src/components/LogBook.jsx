import { useEffect, useState } from "react";
import { api } from "../api.js";
import { formatDate } from "../format.js";
import DetailModal from "./DetailModal.jsx";
import Markdown from "./Markdown.jsx";

const empty = () => ({
  date: new Date().toISOString().slice(0, 10),
  crew: "",
  start: "",
  goal: "",
  description: "",
});

export default function LogBook({ boatId }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(empty());
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(empty());

  async function load() {
    setEntries(await api.listLogbook(boatId));
  }

  useEffect(() => {
    load();
  }, [boatId]);

  async function add(e) {
    e.preventDefault();
    if (!form.start.trim() && !form.goal.trim()) return;
    await api.addLog(boatId, form);
    setForm(empty());
    load();
  }

  async function remove(entry) {
    if (!confirm("Delete this log entry?")) return;
    await api.deleteLog(entry.id);
    load();
  }

  function openEdit(entry) {
    setEditing(entry);
    setEditForm({
      date: String(entry.date).slice(0, 10),
      crew: entry.crew || "",
      start: entry.start || "",
      goal: entry.goal || "",
      description: entry.description || "",
    });
  }

  async function saveEdit() {
    await api.updateLog(editing.id, editForm);
    setEditing(null);
    load();
  }

  function fieldset(data, set) {
    return (
      <>
        <div className="field">
          <label>Date</label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => set({ ...data, date: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Crew members</label>
          <input
            type="text"
            value={data.crew}
            placeholder="e.g. Anna, Marco, Lisa"
            onChange={(e) => set({ ...data, crew: e.target.value })}
          />
        </div>
        <div className="row two">
          <div className="field grow">
            <label>Start</label>
            <input
              type="text"
              value={data.start}
              onChange={(e) => set({ ...data, start: e.target.value })}
            />
          </div>
          <div className="field grow">
            <label>Goal</label>
            <input
              type="text"
              value={data.goal}
              onChange={(e) => set({ ...data, goal: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            value={data.description}
            onChange={(e) => set({ ...data, description: e.target.value })}
          />
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="form-section">
        <h3>Add New Trip</h3>
        <form onSubmit={add}>
          {fieldset(form, setForm)}
          <button type="submit">Add trip</button>
        </form>
      </div>

      <div className="list-section">
        <h3>Log Book</h3>
        {entries.length === 0 && <div className="empty">No trips logged yet.</div>}

        {entries.map((entry) => (
          <div key={entry.id} className="list-item">
            <span className="txt grow clickable" onClick={() => openEdit(entry)}>
              <strong>
                {entry.start || "?"} → {entry.goal || "?"}
              </strong>
              <span className="muted"> — {formatDate(entry.date)}</span>
            </span>
            <button className="danger" onClick={() => remove(entry)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <DetailModal
          title={`${editing.start || "?"} → ${editing.goal || "?"}`}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          view={
            <>
              <p className="muted">{formatDate(editing.date)}</p>
              {editing.crew && (
                <p>
                  <strong>Crew:</strong> {editing.crew}
                </p>
              )}
              <Markdown text={editing.description} />
            </>
          }
          edit={fieldset(editForm, setEditForm)}
        />
      )}
    </div>
  );
}
