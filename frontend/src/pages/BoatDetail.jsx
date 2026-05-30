import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, clearAuth } from "../api.js";
import Documents from "../components/Documents.jsx";
import Maintenance from "../components/Maintenance.jsx";
import Checklist from "../components/Checklist.jsx";
import Shopping from "../components/Shopping.jsx";
import LogBook from "../components/LogBook.jsx";

const TABS = [
  { key: "todos", label: "To-Do" },
  { key: "shopping", label: "Shopping" },
  { key: "logbook", label: "Log Book" },
  { key: "maintenance", label: "Maintenance" },
  { key: "documents", label: "Documents" },
];

export default function BoatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boat, setBoat] = useState(null);
  const [tab, setTab] = useState("todos");

  useEffect(() => {
    api.getBoat(id).then(setBoat).catch(() => navigate("/"));
  }, [id]);

  async function removeBoat() {
    if (!confirm("Delete this boat and all its data?")) return;
    await api.deleteBoat(id);
    navigate("/");
  }

  if (!boat) return null;

  return (
    <>
      <div className="topbar">
        <Link to="/" className="back">← Boats</Link>
        <h1>{boat.name}</h1>
        <div className="grow" />
        <button
          className="ghost"
          onClick={() => {
            clearAuth();
            window.dispatchEvent(new Event("auth-expired"));
          }}
        >
          Sign out
        </button>
      </div>
      <div className="container">
        {boat.description && <p className="muted">{boat.description}</p>}

        <div className="tabs">
          {TABS.map((t) => (
            <div
              key={t.key}
              className={"tab" + (tab === t.key ? " active" : "")}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </div>
          ))}
        </div>

        <div className="card">
          {tab === "todos" && <Checklist kind="todos" boatId={id} placeholder="Add a to-do…" />}
          {tab === "shopping" && <Shopping boatId={id} />}
          {tab === "logbook" && <LogBook boatId={id} />}
          {tab === "maintenance" && <Maintenance boatId={id} />}
          {tab === "documents" && <Documents boatId={id} />}
        </div>

        <button className="danger" onClick={removeBoat}>
          Delete boat
        </button>
      </div>
    </>
  );
}
