import { Device } from "@/lib/types";
import { Activity, HardDrive, Wifi, Clock, Cpu, MemoryStick, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceStatsProps {
  device: Device;
  stats?: {
    cpuPercent?: number | null;
    memoryPercent?: number | null;
    uptime?: string | null;
    runningTimeSeconds?: number | null;
  } | null;
}

export function DeviceStats({ device, stats = null }: DeviceStatsProps) {
  const stats_data = [
    {
      label: "Status",
      value: device.status || 'Unknown',
      icon: Activity,
      color: device.status === 'online' ? 'text-green-500' : device.status === 'warning' ? 'text-orange-500' : 'text-red-500',
      bgColor: device.status === 'online' ? 'bg-green-50 dark:bg-green-900/20' : device.status === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      label: "Type",
      value: device.deviceType,
      icon: HardDrive,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: "SNMP",
      value: device.snmpVersion || 'N/A',
      icon: Wifi,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: "SSH",
      value: device.sshEnabled ? 'Enabled' : 'Disabled',
      icon: Clock,
      color: device.sshEnabled ? 'text-green-500' : 'text-gray-500',
      bgColor: device.sshEnabled ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'
    },
    ...(stats && stats.cpuPercent != null ? [{
      label: "CPU",
      value: `${stats.cpuPercent}%`,
      icon: Cpu,
      color: stats.cpuPercent > 80 ? 'text-red-500' : stats.cpuPercent > 50 ? 'text-orange-500' : 'text-green-500',
      bgColor: stats.cpuPercent > 80 ? 'bg-red-50 dark:bg-red-900/20' : stats.cpuPercent > 50 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20'
    }] : []),
    ...(stats && stats.memoryPercent != null ? [{
      label: "Memory",
      value: `${stats.memoryPercent}%`,
      icon: MemoryStick,
      color: stats.memoryPercent > 80 ? 'text-red-500' : stats.memoryPercent > 50 ? 'text-orange-500' : 'text-green-500',
      bgColor: stats.memoryPercent > 80 ? 'bg-red-50 dark:bg-red-900/20' : stats.memoryPercent > 50 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20'
    }] : []),
    ...(stats && (stats.uptime || stats.runningTimeSeconds != null) ? [{
      label: "Uptime",
      value: stats.uptime || `${Math.floor((stats.runningTimeSeconds || 0) / 3600)}h`,
      icon: Zap,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }] : [])
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {stats_data.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className={cn(
              'flex-shrink-0 px-3 py-2 rounded-lg border flex flex-col items-center justify-center min-w-fit',
              stat.bgColor
            )}
          >
            <div className="flex items-center gap-1 mb-1">
              <IconComponent className={cn('h-3 w-3', stat.color)} />
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <div className={cn('text-sm font-bold capitalize', stat.color)}>
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
