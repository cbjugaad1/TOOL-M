import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Server, 
  Network, 
  Bell, 
  FileText, 
  Activity, 
  Settings, 
  Shield, 
  Map,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Devices", href: "/devices", icon: Server },
  { name: "Topology", href: "/topology", icon: Network },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Syslog", href: "/syslog", icon: FileText },
  { name: "NetFlow", href: "/netflow", icon: Activity },
  { name: "Sites", href: "/sites", icon: Globe },
];

const secondaryNavigation = [
  { name: "Admin", href: "/admin", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-sidebar-primary-foreground">
          <Network className="h-6 w-6 text-sidebar-primary" />
          <span>NetGuardian</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-sidebar-primary/10 text-sidebar-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                  )} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-3">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            System
          </h3>
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-sidebar-primary/10 text-sidebar-primary" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                    )} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-sidebar-border/50 p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            <span className="font-bold text-xs text-sidebar-primary">AD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-sidebar-foreground/50">Super Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
