import { useState } from "react";
import { api } from "../api.js";

export default function Settings({ boat, setBoat, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(boat.name);
  const [description, setDescription] = useState(boat.description || "");
  const [saving, setSaving] = useState(false);

  async function saveBoat() {
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      const updated = await api.updateBoat(boat.id, { 
        name: name.trim(), 
        description: description.trim() || null 
      });
      setBoat(updated);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update boat");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setName(boat.name);
    setDescription(boat.description || "");
    setIsEditing(false);
  }

  return (
    <div className="settings">
      <h3>Boat Settings</h3>
      
      <div className="settings-section">
        <h4>Boat Information</h4>
        
        {!isEditing ? (
          <div className="boat-info">
            <div className="field-display">
              <label>Name:</label>
              <span>{boat.name}</span>
            </div>
            {boat.description && (
              <div className="field-display">
                <label>Description:</label>
                <span>{boat.description}</span>
              </div>
            )}
            <button onClick={() => setIsEditing(true)}>
              Edit Boat Information
            </button>
          </div>
        ) : (
          <div className="boat-edit">
            <div className="field">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="field">
              <label>Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                disabled={saving}
                rows="3"
              />
            </div>
            <div className="buttons">
              <button onClick={saveBoat} disabled={saving || !name.trim()}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="ghost" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section danger-section">
        <h4>Danger Zone</h4>
        <p className="muted">
          Once you delete a boat, there is no going back. Please be certain.
        </p>
        <button className="danger" onClick={onDelete}>
          Delete Boat
        </button>
      </div>
    </div>
  );
}