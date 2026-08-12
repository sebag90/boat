import { marked } from 'marked';

let authHeaderValue = localStorage.getItem('auth_header') || '';

export const setAuthHeader = (header) => {
  authHeaderValue = header;
  if (header) {
    localStorage.setItem('auth_header', header);
  } else {
    localStorage.removeItem('auth_header');
  }
};

export const getAuthHeader = () => authHeaderValue;

export const request = async (endpoint, options = {}) => {
  const apiHost = localStorage.getItem('api_host') || '';
  const url = endpoint.startsWith('http') ? endpoint : `${apiHost}${endpoint}`;

  const headers = options.headers ? { ...options.headers } : {};
  if (authHeaderValue && !headers['Authorization']) {
    headers['Authorization'] = authHeaderValue;
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    let errData = {};
    try { errData = await res.json(); } catch (e) {}
    throw new Error(errData.detail || `Request failed with status ${res.status}`);
  }
  return res;
};

// Formats YYYY-MM-DD or ISO string to European DD-MM-YYYY
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const cleanDate = String(dateStr).split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export const toLocalISOString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return new Date().toISOString();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Formats ISO string to European DD-MM-YYYY HH:MM
export const formatDateTime = (isoStr) => {
  if (!isoStr) return '';
  const match = String(isoStr).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (match) {
    const [, yyyy, mm, dd, hrs, mins] = match;
    return `${dd}-${mm}-${yyyy} ${hrs}:${mins}`;
  }
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hrs}:${mins}`;
  } catch (e) {
    return String(isoStr);
  }
};

export const renderMarkdown = (text) => {
  if (!text) return '';
  try {
    return marked.parse(text);
  } catch (e) {
    return text;
  }
};

export const getTodayDateString = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

// Waypoint & Nautical calculations
export const calculateDistanceNM = (lat1, lon1, lat2, lon2) => {
  const R = 3440.065; // Earth radius in Nautical Miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateLegStats = (wp1, wp2) => {
  if (!wp1 || !wp2) return { distanceNM: 0, distanceKm: 0, durationMs: 0, speedKnots: 0, speedKmh: 0 };
  const distNM = calculateDistanceNM(wp1.latitude, wp1.longitude, wp2.latitude, wp2.longitude);
  const distKm = distNM * 1.852;

  let durationMs = 0;
  if (wp1.timestamp && wp2.timestamp) {
    const t1 = new Date(wp1.timestamp).getTime();
    const t2 = new Date(wp2.timestamp).getTime();
    durationMs = Math.abs(t2 - t1);
  }

  let speedKnots = 0;
  let speedKmh = 0;
  if (durationMs > 0) {
    const hours = durationMs / (1000 * 60 * 60);
    speedKnots = distNM / hours;
    speedKmh = distKm / hours;
  }

  return { distanceNM: distNM, distanceKm: distKm, durationMs, speedKnots, speedKmh };
};

export const calculateVoyageSummary = (waypoints) => {
  if (!waypoints || waypoints.length < 2) {
    return { totalDistanceNM: 0, totalDistanceKm: 0, totalDurationMs: 0, avgSpeedKnots: 0, avgSpeedKmh: 0 };
  }
  let totalNM = 0;
  let totalKm = 0;

  for (let i = 1; i < waypoints.length; i++) {
    const stats = calculateLegStats(waypoints[i - 1], waypoints[i]);
    totalNM += stats.distanceNM;
    totalKm += stats.distanceKm;
  }

  const tStart = new Date(waypoints[0].timestamp).getTime();
  const tEnd = new Date(waypoints[waypoints.length - 1].timestamp).getTime();
  let totalMs = 0;
  if (!isNaN(tStart) && !isNaN(tEnd) && tEnd > tStart) {
    totalMs = tEnd - tStart;
  }

  let avgKnots = 0;
  let avgKmh = 0;
  if (totalMs > 0) {
    const totalHours = totalMs / (1000 * 60 * 60);
    avgKnots = totalNM / totalHours;
    avgKmh = totalKm / totalHours;
  }

  return { totalDistanceNM: totalNM, totalDistanceKm: totalKm, totalDurationMs: totalMs, avgSpeedKnots: avgKnots, avgSpeedKmh: avgKmh };
};

export const formatDuration = (ms) => {
  if (isNaN(ms) || ms <= 0) return '0m';
  const totalMins = Math.floor(ms / (1000 * 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

export const importWaypoints = async (entryId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await request(`/api/logbook/${entryId}/waypoints/import`, {
    method: 'POST',
    body: formData
  });
  return await res.json();
};

export const getOpenStreetMapUrl = (waypoints) => {
  if (!waypoints || waypoints.length === 0) return 'https://geojson.io/';

  const features = [];

  if (waypoints.length > 1) {
    features.push({
      type: 'Feature',
      properties: {
        stroke: '#0284c7',
        'stroke-width': 4,
        'stroke-opacity': 0.85
      },
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map(w => [w.longitude, w.latitude])
      }
    });
  }

  waypoints.forEach((w, idx) => {
    let title = `Waypoint ${idx + 1}`;
    if (w.name) title += `: ${w.name}`;
    let color = '#2563eb';
    let symbol = 'circle';
    if (idx === 0) {
      color = '#16a34a';
      symbol = 'play';
    } else if (idx === waypoints.length - 1) {
      color = '#dc2626';
      symbol = 'stop';
    }

    features.push({
      type: 'Feature',
      properties: {
        title,
        'marker-color': color,
        'marker-size': 'medium',
        'marker-symbol': symbol
      },
      geometry: {
        type: 'Point',
        coordinates: [w.longitude, w.latitude]
      }
    });
  });

  const geojson = {
    type: 'FeatureCollection',
    features
  };

  const jsonStr = JSON.stringify(geojson);
  const bytes = new TextEncoder().encode(jsonStr);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  const base64 = btoa(binString);

  return `https://geojson.io/#data=data:application/json;base64,${base64}`;
};

// Attachment helpers with correct backend endpoints
export const hasAttachment = (entry, type) => {
  if (!entry) return false;
  if (type === 'documents') return !!entry.filename;
  if (type === 'maintenance') return !!entry.receipt_filename;
  if (type === 'todo' || type === 'shopping') return !!entry.file_filename;
  return false;
};

export const getAttachmentName = (entry, type) => {
  if (!entry) return '';
  if (type === 'documents') return entry.filename;
  if (type === 'maintenance') return entry.receipt_filename;
  if (type === 'todo' || type === 'shopping') return entry.file_filename;
  return '';
};

export const getAttachmentUrlWithAuth = (entry, type) => {
  if (!entry || !type) return '';
  const apiHost = localStorage.getItem('api_host') || '';
  let endpoint = '';
  if (type === 'documents') endpoint = `/api/documents/${entry.id}/download`;
  else if (type === 'maintenance') endpoint = `/api/maintenance/${entry.id}/receipt`;
  else if (type === 'todo') endpoint = `/api/todos/${entry.id}/file`;
  else if (type === 'shopping') endpoint = `/api/shopping/${entry.id}/file`;

  const baseUrl = endpoint.startsWith('http') ? endpoint : `${apiHost}${endpoint}`;
  if (authHeaderValue && authHeaderValue.startsWith('Basic ')) {
    const token = authHeaderValue.replace('Basic ', '');
    return `${baseUrl}?auth=${encodeURIComponent(token)}`;
  }
  return baseUrl;
};
