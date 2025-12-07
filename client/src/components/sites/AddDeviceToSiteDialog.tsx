import { useState, useEffect } from "react";
import { getDevices, updateDevice } from "@/lib/api";
import { Device } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";

interface AddDeviceToSiteDialogProps {
  siteId: number;
  onDevicesAdded: () => void;
}

export function AddDeviceToSiteDialog({
  siteId,
  onDevicesAdded,
}: AddDeviceToSiteDialogProps) {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [assigning, setAssigning] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadDevices();
    }
  }, [open]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const allDevices = await getDevices();
      setDevices(allDevices || []);
    } catch (err) {
      console.error("Failed to load devices:", err);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (deviceId: number, deviceSiteId: number | null) => {
    setAssigning(deviceId);
    try {
      // Update device to move to this site
      await updateDevice(deviceId, {
        site_id: siteId,
      });
      await loadDevices();
      onDevicesAdded();
    } catch (err) {
      console.error("Failed to assign device:", err);
    } finally {
      setAssigning(null);
    }
  };

  const filteredDevices = devices.filter((d) =>
    (d.hostname || "").toLowerCase().includes(search.toLowerCase()) ||
    d.ipAddress.includes(search)
  );

  const getSiteLabel = (siteId: number | null) => {
    return siteId ? `Site ${siteId}` : "Unassigned";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Devices to Site
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Devices to Site</DialogTitle>
          <DialogDescription>
            Select devices to add to this site. Click on a device to assign it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search by hostname or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading devices…</div>
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {devices.length === 0 ? "No devices found" : "No matching devices"}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredDevices.map((device) => {
                const isAlreadyInThisSite = device.siteId === siteId;
                return (
                  <Card key={device.id} className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{device.hostname || "Unknown"}</p>
                          <p className="text-sm text-gray-600">{device.ipAddress}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">
                              {device.deviceType || "Unknown"}
                            </Badge>
                            <Badge
                              variant={
                                isAlreadyInThisSite ? "default" : "secondary"
                              }
                            >
                              {isAlreadyInThisSite
                                ? "✓ In this site"
                                : getSiteLabel(device.siteId)}
                            </Badge>
                          </div>
                        </div>
                        {!isAlreadyInThisSite && (
                          <Button
                            size="sm"
                            onClick={() => handleAddDevice(device.id, device.siteId)}
                            disabled={assigning === device.id}
                          >
                            {assigning === device.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                {device.siteId ? "Move to Site" : "Add to Site"}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
