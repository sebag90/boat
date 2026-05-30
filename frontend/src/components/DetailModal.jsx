import { useState } from "react";

// A popup that first shows a read-only view of an entry and, only when the
// "Modify" button is pressed, switches to an editable form.
export default function DetailModal({ title, view, edit, onSave, onClose }) {
  const [mode, setMode] = useState("view");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {mode === "view" ? (
          <>
            <h2 style={{ marginTop: 0 }}>{title}</h2>
            {view}
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button type="button" className="secondary" onClick={onClose}>
                Close
              </button>
              <button type="button" onClick={() => setMode("edit")}>
                Modify
              </button>
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
          >
            <h2 style={{ marginTop: 0 }}>Edit</h2>
            {edit}
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="secondary" onClick={() => setMode("view")}>
                Cancel
              </button>
              <button type="submit">Save</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
