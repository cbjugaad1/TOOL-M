import React from "react";
import { AddDeviceDialog } from "@/components/devices/AddDeviceDialog";

export default function DevicesTest() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Devices Test Page</h1>
      <AddDeviceDialog onAdd={(device) => console.log("DevicesTest: added device", device)} />
    </div>
  );
}
