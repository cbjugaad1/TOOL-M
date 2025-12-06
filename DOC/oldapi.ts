import axios from 'axios';
import { Device, Alert, Site, NetworkInterface, TopologyLink } from './types';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ----------------------------------------------------
   Normalize device status
-----------------------------------------------------*/
function normalizeStatus(status: string | null | undefined) {
  if (!status) return "offline";

  const s = status.toLowerCase();

  if (s === "up") return "online";
  if (s === "down") return "offline";
  if (s === "unknown") return "warning";

  return s;
}

/* ----------------------------------------------------
   DEVICES  (FASTAPI → REQUIRE TRAILING SLASH)
-----------------------------------------------------*/
export const getDevices = async (): Promise<Device[]> => {
  const response = await api.get<Device[]>('/devices/');   // <-- FIXED SLASH

  return response.data.map((d) => ({
    ...d,
    status: normalizeStatus(d.status),
  }));
};

export const getDevice = async (id: number): Promise<Device> => {
  const response = await api.get<Device>(`/devices/${id}/`); // <-- FIXED

  return {
    ...response.data,
    status: normalizeStatus(response.data.status),
  };
};

export const createDevice = async (device: Partial<Device>): Promise<Device> => {
  const response = await api.post<Device>('/devices/', device); // <-- FIXED

  return {
    ...response.data,
    status: normalizeStatus(response.data.status),
  };
};

export const updateDevice = async (id: number, device: Partial<Device>): Promise<Device> => {
  const response = await api.put<Device>(`/devices/${id}/`, device); // <-- FIXED

  return {
    ...response.data,
    status: normalizeStatus(response.data.status),
  };
};

export const deleteDevice = async (id: number): Promise<void> => {
  await api.delete(`/devices/${id}/`); // <-- FIXED
};

/* ----------------------------------------------------
   INTERFACES (FASTAPI → REQUIRE SLASH)
-----------------------------------------------------*/
export const getDeviceInterfaces = async (deviceId: number): Promise<NetworkInterface[]> => {
  const response = await api.get<NetworkInterface[]>(`/devices/${deviceId}/interfaces/`); // <-- FIXED
  return response.data;
};

export const getInterface = async (id: number): Promise<NetworkInterface> => {
  const response = await api.get<NetworkInterface>(`/interfaces/${id}/`); // <-- FIXED
  return response.data;
};

export const getInterfaceStats = async (interfaceId: number) => {
  const response = await api.get(`/interfaces/${interfaceId}/stats/`); // <-- FIXED
  return response.data;
};

/* ----------------------------------------------------
   STATS (FASTAPI)
-----------------------------------------------------*/
export const getDeviceStats = async (deviceId: number) => {
  const response = await api.get(`/devices/${deviceId}/stats/latest/`); // <-- FIXED
  return response.data;
};

export const getLatestStats = async () => {
  const response = await api.get('/stats/latest/'); // <-- FIXED
  return response.data;
};

/* ----------------------------------------------------
   ALERTS (EXPRESS → NO TRAILING SLASH)
-----------------------------------------------------*/
export const getAlerts = async (): Promise<Alert[]> => {
  const response = await api.get<Alert[]>('/alerts');    // <-- NO SLASH
  return response.data;
};

export const getDeviceAlerts = async (deviceId: number): Promise<Alert[]> => {
  const response = await api.get<Alert[]>(`/alerts/device/${deviceId}`); // <-- NO SLASH
  return response.data;
};

export const createAlert = async (alert: Partial<Alert>): Promise<Alert> => {
  const response = await api.post<Alert>('/alerts', alert); // <-- NO SLASH
  return response.data;
};

/* ----------------------------------------------------
   SITES (FASTAPI)
-----------------------------------------------------*/
export const getSites = async (): Promise<Site[]> => {
  const response = await api.get<Site[]>('/sites/'); // <-- FIXED
  return response.data;
};

export const getSite = async (id: number): Promise<Site> => {
  const response = await api.get<Site>(`/sites/${id}/`); // <-- FIXED
  return response.data;
};

export const createSite = async (site: Partial<Site>): Promise<Site> => {
  const response = await api.post<Site>('/sites/', site); // <-- FIXED
  return response.data;
};

export const updateSite = async (id: number, site: Partial<Site>): Promise<Site> => {
  const response = await api.put<Site>(`/sites/${id}/`, site); // <-- FIXED
  return response.data;
};

export const deleteSite = async (id: number): Promise<void> => {
  await api.delete(`/sites/${id}/`); // <-- FIXED
};

/* ----------------------------------------------------
   TOPOLOGY (FASTAPI)
-----------------------------------------------------*/
export const getTopology = async () => {
  const response = await api.get('/topology/'); // <-- FIXED
  return response.data;
};

export const getTopologyLinks = async (): Promise<TopologyLink[]> => {
  const response = await api.get<TopologyLink[]>('/topology/links/'); // <-- FIXED
  return response.data;
};

export const getTopologyGraph = async () => {
  const response = await api.get('/topology/graph/'); // <-- FIXED
  return response.data;
};

/* ----------------------------------------------------
   HEALTH CHECK
-----------------------------------------------------*/
export const healthCheck = async () => {
  const response = await api.get('/health/'); // <-- FIXED
  return response.data;
};
