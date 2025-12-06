// client/src/components/dashboard/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, Server, Flame } from "lucide-react";
import { Device, Alert } from "@/lib/types";
import { useLocation } from "wouter";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface StatsCardsProps {
  devices: Device[];
  alerts: Alert[];
}

export function StatsCards({ devices, alerts }: StatsCardsProps) {
  const [, setLocation] = useLocation();

  // MAC change logs from Redux
  const macLogs = useSelector((s: RootState) => s.macChanges.logs);
  const allMacLogs = Object.values(macLogs).flat();

  // Devices with MAC changes
  const macChangeDevices = devices.filter((d) =>
    allMacLogs.some((log) => log.device_id === d.id)
  );

  // Device counts
  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;

  // Alert counts
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const warningAlerts = alerts.filter((a) => a.severity === "warning").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* MAC Change Alarms */}
      <Card
        className="border-l-4 border-l-yellow-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => setLocation("/devices?filter=mac-change")}
      >
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">
            MAC Change Alarms
          </CardTitle>
          <Flame className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">{macChangeDevices.length}</div>
          <p className="text-xs text-muted-foreground">Devices with MAC changes</p>
        </CardContent>
      </Card>

      {/* Online Devices */}
      <Card
        className="border-l-4 border-l-green-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => setLocation("/devices?filter=online")}
      >
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{onlineCount}</div>
          <p className="text-xs text-muted-foreground">
            {devices.length ? Math.round((onlineCount / devices.length) * 100) : 0}% of fleet
          </p>
        </CardContent>
      </Card>

      {/* Offline Devices */}
      <Card
        className="border-l-4 border-l-red-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => setLocation("/devices?filter=offline")}
      >
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{offlineCount}</div>
          <p className="text-xs text-muted-foreground">Devices unreachable</p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card
        className="border-l-4 border-l-orange-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => setLocation("/alerts")}
      >
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{criticalAlerts + warningAlerts}</div>
          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
            <span className="text-red-500 font-medium">{criticalAlerts} Critical</span>
            <span className="text-orange-500 font-medium">{warningAlerts} Warning</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Inventory */}
      <Card
        className="border-l-4 border-l-blue-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => setLocation("/devices?filter=all")}
      >
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
          <Server className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{devices.length}</div>
          <p className="text-xs text-muted-foreground">Managed devices</p>
        </CardContent>
      </Card>
    </div>
  );
}
