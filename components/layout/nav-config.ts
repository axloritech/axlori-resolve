import {
  BarChart3,
  FileText,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", Icon: LayoutDashboard, roles: ["student", "staff", "admin"] },
  { href: "/reports", label: "Reports", Icon: FileText, roles: ["student", "staff", "admin"] },
  { href: "/locations", label: "Map & Locations", Icon: MapPin, roles: ["student", "staff", "admin"] },
  { href: "/analytics", label: "Analytics", Icon: BarChart3, roles: ["staff", "admin"] },
  { href: "/team", label: "Team", Icon: Users, roles: ["staff", "admin"] },
  { href: "/settings", label: "Settings", Icon: Settings, roles: ["student", "staff", "admin"] },
];

export function itemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export const PAGE_TITLES: Record<string, { crumb: string; title: string }> = {
  "/": { crumb: "Workspace / Overview", title: "Dashboard" },
  "/reports": { crumb: "Workspace / Reports", title: "Reports" },
  "/reports/new": { crumb: "Workspace / Reports / New report", title: "Report an issue" },
  "/locations": { crumb: "Workspace / Map & Locations", title: "Map & Locations" },
  "/analytics": { crumb: "Workspace / Analytics", title: "Analytics" },
  "/team": { crumb: "Workspace / Team", title: "Team" },
  "/settings": { crumb: "Workspace / Settings", title: "Settings" },
  "/terms": { crumb: "Legal / Terms", title: "Terms and Conditions" },
  "/privacy": { crumb: "Legal / Privacy", title: "Privacy Policy" },
};

export function titleForPath(pathname: string): { crumb: string; title: string } {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/reports/")) {
    const id = pathname.split("/")[2];
    return { crumb: `Workspace / Reports / ${id}`, title: `Report ${id}` };
  }
  return { crumb: "Workspace", title: "Axlori Resolve" };
}
