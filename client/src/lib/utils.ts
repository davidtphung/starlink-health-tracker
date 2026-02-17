import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function getHealthColor(status: string): string {
  switch (status) {
    case "nominal":
      return "text-spacex-success";
    case "degraded":
      return "text-spacex-warning";
    case "critical":
      return "text-spacex-danger";
    case "decayed":
      return "text-gray-500";
    default:
      return "text-gray-400";
  }
}

export function getHealthBgColor(status: string): string {
  switch (status) {
    case "nominal":
      return "bg-spacex-success/20";
    case "degraded":
      return "bg-spacex-warning/20";
    case "critical":
      return "bg-spacex-danger/20";
    case "decayed":
      return "bg-gray-500/20";
    default:
      return "bg-gray-400/20";
  }
}

export function getLaunchSiteName(site: string): string {
  const siteMap: Record<string, string> = {
    AFETR: "Cape Canaveral SFS, FL",
    KSC: "Kennedy Space Center, FL",
    VAFB: "Vandenberg SFB, CA",
    KWAJ: "Kwajalein Atoll",
  };
  return siteMap[site] || site;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function latLonToXYZ(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = degToRad(90 - lat);
  const theta = degToRad(lon + 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}
