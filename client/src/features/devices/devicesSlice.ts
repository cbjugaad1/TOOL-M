// client/src/features/devices/devicesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Device, NetworkInterface } from "@/lib/types";
import { getDevices, getDeviceInterfaces } from "@/lib/api";

interface DevicesState {
  items: Device[];
  selectedDevice: Device | null;
  selectedDeviceInterfaces: NetworkInterface[];
  loading: boolean;

  // Filters used by your UI
  search: string;
  filter: "all" | "online" | "offline" | "warning" | "mac-change";

  error: string | null;
}

const initialState: DevicesState = {
  items: [],
  selectedDevice: null,
  selectedDeviceInterfaces: [],
  loading: false,

  // Default filter values
  search: "",
  filter: "all",

  error: null,
};

// Fetch all devices and normalize status
export const fetchDevices = createAsyncThunk<Device[]>(
  "devices/fetchDevices",
  async () => {
    // Do not normalize status here; keep backend value (e.g., 'up'/'down')
    const devices = await getDevices();
    return devices as Device[];
  }
);

// Fetch interfaces of a single device
export const fetchDeviceInterfaces = createAsyncThunk<
  NetworkInterface[],
  number
>("devices/fetchDeviceInterfaces", async (deviceId) => {
  const interfaces = await getDeviceInterfaces(deviceId);
  return interfaces;
});

export const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.items = action.payload;
    },

    addDevice: (state, action: PayloadAction<Device>) => {
      state.items.push(action.payload);
    },

    updateDeviceStatus: (
      state,
      action: PayloadAction<{ id: number; status: "online" | "offline" | "warning" }>
    ) => {
      const device = state.items.find((d: Device) => d.id === action.payload.id);
      if (device) {
        device.status = action.payload.status;
      }
    },

    selectDevice: (state, action: PayloadAction<number>) => {
      state.selectedDevice = state.items.find(
        (d: Device) => d.id === action.payload
      ) || null;
    },

    setSelectedDeviceInterfaces: (
      state,
      action: PayloadAction<NetworkInterface[]>
    ) => {
      state.selectedDeviceInterfaces = action.payload;
    },

    deleteDevice: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((d: Device) => d.id !== action.payload);

      if (state.selectedDevice?.id === action.payload) {
        state.selectedDevice = null;
        state.selectedDeviceInterfaces = [];
      }
    },

    /* -----------------------------
       FILTER ACTIONS FOR DEVICES PAGE
    ------------------------------*/
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },

    setFilter: (
      state,
      action: PayloadAction<"all" | "online" | "offline" | "warning" | "mac-change">
    ) => {
      state.filter = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch devices";
      })
      .addCase(fetchDeviceInterfaces.fulfilled, (state, action) => {
        state.selectedDeviceInterfaces = action.payload;
      });
  },
});

export const {
  setDevices,
  addDevice,
  updateDeviceStatus,
  selectDevice,
  setSelectedDeviceInterfaces,
  deleteDevice,

  // Filters
  setSearch,
  setFilter,
} = devicesSlice.actions;

export default devicesSlice.reducer;
