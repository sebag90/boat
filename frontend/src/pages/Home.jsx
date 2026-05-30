import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearAuth, currentUser } from "../api.js";

function logout() {
  clearAuth();
  window.dispatchEvent(new Event("auth-expired"));
}

export default function Home() {
  const [boats, setBoats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  async function load() {
    setBoats(await api.listBoats());
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const boat = await api.createBoat({ name: name.trim(), description });
    setShowModal(false);
    setName("");
    setDescription("");
    navigate(`/boats/${boat.id}`);
  }

  return (
    <>
      <div className="topbar">
        <h1>⚓ Boat Organizer</h1>
        <div className="grow" />
        <span className="muted-light">{currentUser()}</span>
        <button className="ghost" onClick={logout}>
          Sign out
        </button>
      </div>
      <div className="container">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>My boats</h2>
          <button onClick={() => setShowModal(true)}>+ Add boat</button>
        </div>

        {boats.length === 0 && (
          <p className="empty">No boats yet. Add your first boat to get started.</p>
        )}

        <div className="boat-grid">
          {boats.map((b) => (
            <div
              key={b.id}
              className="boat-card"
              onClick={() => navigate(`/boats/${b.id}`)}
            >
              <h3>{b.name}</h3>
              <div className="muted">{b.description || "No description"}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={create}>
            <h2 style={{ marginTop: 0 }}>Add boat</h2>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit">Create</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
