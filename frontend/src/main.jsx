import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { api, isAuthed } from "./api.js";
import Home from "./pages/Home.jsx";
import BoatDetail from "./pages/BoatDetail.jsx";
import Login from "./pages/Login.jsx";
import "./styles.css";

function App() {
  // null = checking, false = logged out, true = logged in
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    if (!isAuthed()) {
      setAuthed(false);
      return;
    }
    api.me().then(
      () => setAuthed(true),
      () => setAuthed(false)
    );
  }, []);

  useEffect(() => {
    const handler = () => setAuthed(false);
    window.addEventListener("auth-expired", handler);
    return () => window.removeEventListener("auth-expired", handler);
  }, []);

  if (authed === null) return null;
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boats/:id" element={<BoatDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
