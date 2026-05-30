import { useState } from "react";
import { api, setAuth, clearAuth } from "../api.js";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    setAuth(username, password);
    try {
      await api.me();
      onLogin();
    } catch {
      clearAuth();
      setError("Invalid username or password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <h1>⚓ Boat Organizer</h1>
      </div>
      <div className="container">
        <form className="card" style={{ maxWidth: 360, margin: "40px auto" }} onSubmit={submit}>
          <h2 style={{ marginTop: 0 }}>Sign in</h2>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
          <button type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </>
  );
}
