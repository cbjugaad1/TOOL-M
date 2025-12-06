// ------------------------------------------------------------
// FULL UPDATED api.ts — MATCHED WITH YOUR BACKEND
// ------------------------------------------------------------

const API_BASE = "http://127.0.0.1:8000";

// Utility function to convert snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
}

// Utility function to recursively convert object keys from snake_case to camelCase
function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    const newObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = toCamelCase(key);
        const value = obj[key];
        newObj[camelKey] = convertKeysToCamelCase(value);
      }
    }
    return newObj;
  }
  return obj;
}

// Generic GET wrapper
async function api(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API Error: ${res.status} ${path}`);
  return res.json();
}

// Generic POST wrapper
async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API POST Error: ${res.status} ${path}`);
  return res.json();
}

// Generic PUT wrapper
async function apiPut(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API PUT Error: ${res.status} ${path}`);
  return res.json();
}

// Generic DELETE wrapper
async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API DELETE Error: ${res.status} ${path}`);
  return res.json();
}

// ------------------------------------------------------------
// DEVICE APIs
// ------------------------------------------------------------

export const getDevices = async () => {
  const data = await api("/devices");
  return convertKeysToCamelCase(data);
};

export const getDevice = async (id: number) => {
  const data = await api(`/devices/${id}`);
  return convertKeysToCamelCase(data);
};
export const createDevice = (data: any) => apiPost("/devices", data);
export const updateDevice = (id: number, data: any) =>
  apiPut(`/devices/${id}`, data);
export const deleteDevice = (id: number) => apiDelete(`/devices/${id}`);

export const getDeviceInterfaces = async (deviceId: number) => {
  const data = await api(`/devices/${deviceId}/interfaces`);
  return convertKeysToCamelCase(data);
};

export const getInterface = (id: number) => api(`/interfaces/${id}`);

export const getDeviceStats = async (deviceId: number) => {
  const data = await api(`/devices/${deviceId}/stats`);
  return convertKeysToCamelCase(data);
};

export const getInterfaceStats = async (interfaceId: number) => {
  const data = await api(`/interfaces/${interfaceId}/stats`);
  return convertKeysToCamelCase(data);
};

export const getLatestStats = async () => {
  const data = await api(`/stats/latest`);
  return convertKeysToCamelCase(data);
};


// ------------------------------------------------------------
// ALERT APIs
// ------------------------------------------------------------

export const getAlerts = async () => {
  const data = await api("/alerts");
  return convertKeysToCamelCase(data);
};

export const getDeviceAlerts = async (deviceId: number) => {
  const data = await api(`/alerts/device/${deviceId}`);
  return convertKeysToCamelCase(data);
};
export const createAlert = (data: any) => apiPost("/alerts", data);


// ------------------------------------------------------------
// SITES APIs
// ------------------------------------------------------------

export const getSites = async () => {
  const data = await api("/sites");
  return convertKeysToCamelCase(data);
};

export const getSite = async (id: number) => {
  const data = await api(`/sites/${id}`);
  return convertKeysToCamelCase(data);
};
export const createSite = (data: any) => apiPost("/sites", data);
export const updateSite = (id: number, data: any) =>
  apiPut(`/sites/${id}`, data);
export const deleteSite = (id: number) => apiDelete(`/sites/${id}`);


// ------------------------------------------------------------
// TOPOLOGY APIs
// ------------------------------------------------------------

// Your backend exposes:
//   /api/topology/links
//   /api/topology/graph

export const getTopologyLinks = async () => {
  const data = await api("/topology/links");
  return convertKeysToCamelCase(data);
};

export const getTopologyGraph = async () => {
  const data = await api("/topology/graph");
  return convertKeysToCamelCase(data);
};

// ------------------------------------------------------------
// FIX: Missing export - Frontend expects getTopology()
// ------------------------------------------------------------

export async function getTopology() {
  const [graph, links] = await Promise.all([
    getTopologyGraph(),
    getTopologyLinks(),
  ]);

  return {
    nodes: graph.nodes,
    edges: graph.edges,
    links: links,
  };
}


// ------------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------------

export const healthCheck = () => api("/health");


// ------------------------------------------------------------
// EXPORT DEFAULT (optional)
// ------------------------------------------------------------

export default {
  api,
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceInterfaces,
  getInterface,
  getDeviceStats,
  getInterfaceStats,
  getLatestStats,

  getAlerts,
  getDeviceAlerts,
  createAlert,

  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,

  getTopologyLinks,
  getTopologyGraph,
  getTopology,

  healthCheck,
};
