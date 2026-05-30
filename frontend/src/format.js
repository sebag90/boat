// Europe locale formatting: DD-MM-YYYY HH:MM
function pad(n) {
  return String(n).padStart(2, "0");
}

export function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function formatDate(value) {
  if (!value) return "";
  // value may be YYYY-MM-DD
  const [y, m, day] = String(value).slice(0, 10).split("-");
  return `${day}-${m}-${y}`;
}
