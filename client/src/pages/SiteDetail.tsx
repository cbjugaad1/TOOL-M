import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { getSites, getDevices } from "@/lib/api";
import { Site, Device } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddDeviceToSiteDialog } from "@/components/sites/AddDeviceToSiteDialog";

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const siteId = Number(id);
      
      // Fetch site details
      const allSites = await getSites();
      const foundSite = allSites.find((s: Site) => s.id === siteId);
      setSite(foundSite || null);

      // Fetch all devices and filter by site_id
      const allDevices = await getDevices();
      const siteDevices = allDevices.filter((d: Device) => d.siteId === siteId);
      setDevices(siteDevices);
    } catch (err: any) {
      setError(err.message || "Failed to load site details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDevicesAdded = () => {
    fetchData();
  };

  if (loading) {
    return <div className="text-center py-8">Loading site details…</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!site) {
    return <div className="text-center py-8">Site not found.</div>;
  }

  // Group devices by type
  const devicesByType: Record<string, Device[]> = {};
  devices.forEach((device) => {
    const type = device.deviceType || "Unknown";
    if (!devicesByType[type]) {
      devicesByType[type] = [];
    }
    devicesByType[type].push(device);
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{site.siteName}</h1>
          <p className="text-muted-foreground">
            {site.location && `Location: ${site.location}`}
          </p>
          {site.description && (
            <p className="text-muted-foreground">{site.description}</p>
          )}
        </div>
        {site && (
          <AddDeviceToSiteDialog siteId={site.id} onDevicesAdded={handleDevicesAdded} />
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Total Devices: <span className="font-semibold">{devices.length}</span>
      </div>

      {Object.keys(devicesByType).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No devices assigned to this site.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(devicesByType).map(([type, typeDevices]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold mb-4">{type} ({typeDevices.length})</h2>
              <div className="grid gap-4">
                {typeDevices.map((device) => (
                  <Card key={device.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{device.hostname || "Unknown"}</CardTitle>
                        <Badge className={getStatusColor(device.status || null)}>
                          {device.status || "unknown"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div>
                          <span className="text-sm text-muted-foreground">IP Address:</span>
                          <p className="font-mono">{device.ipAddress}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
