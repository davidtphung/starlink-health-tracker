export interface StarlinkSatellite {
  id: string;
  name: string;
  noradId: number;
  version: string;
  status: "active" | "decayed" | "unknown";
  latitude: number | null;
  longitude: number | null;
  heightKm: number | null;
  velocityKms: number | null;
  inclination: number;
  eccentricity: number;
  period: number;
  apoapsis: number;
  periapsis: number;
  meanMotion: number;
  bstar: number;
  epoch: string;
  launchDate: string | null;
  decayDate: string | null;
  objectType: string;
  rcsSize: string;
  site: string;
  objectId: string;
  launchId: string | null;
  // Derived health
  healthScore: number;
  healthStatus: "nominal" | "degraded" | "critical" | "decayed";
  ageInDays: number;
}

export interface SpaceXLaunch {
  id: string;
  flightNumber: number;
  name: string;
  dateUtc: string;
  dateLocal: string;
  success: boolean | null;
  details: string | null;
  rocketId: string;
  rocketName: string;
  launchpadId: string;
  launchpadName: string;
  launchpadLocality: string;
  cores: CoreInfo[];
  starlinkCount: number;
  links: {
    webcast: string | null;
    article: string | null;
    wikipedia: string | null;
    patch: string | null;
  };
}

export interface CoreInfo {
  serial: string;
  flight: number;
  reused: boolean;
  landingSuccess: boolean | null;
  landingType: string | null;
}

export interface ConstellationStats {
  totalSatellites: number;
  activeSatellites: number;
  decayedSatellites: number;
  avgAltitudeKm: number;
  avgAge: number;
  byVersion: Record<string, number>;
  byHealthStatus: Record<string, number>;
  totalLaunches: number;
  totalStarlinkLaunches: number;
  uniqueBoosters: number;
  mostFlownBooster: { serial: string; flights: number } | null;
  launchesByYear: Record<string, number>;
  satellitesByYear: Record<string, number>;
}

export interface FunFact {
  label: string;
  value: string;
  description: string;
  icon: string;
}

export interface WebcastLink {
  url: string;
  title: string;
  source: string;
  live: boolean;
}

export interface LiveLaunchData {
  nextLaunch: {
    id: string;
    name: string;
    net: string; // ISO date string — "No Earlier Than"
    status: string; // "Go", "TBD", "Hold", "In Flight", "Success", "Failure"
    statusDescription: string;
    rocketName: string;
    padName: string;
    padLocation: string;
    missionDescription: string | null;
    image: string | null;
    webcasts: WebcastLink[];
    booster: {
      serial: string;
      flights: number;
    } | null;
  } | null;
  recentPastLaunches: Array<{
    id: string;
    name: string;
    net: string;
    status: string;
    webcasts: WebcastLink[];
    image: string | null;
  }>;
  isLiveNow: boolean;
  countdownSeconds: number | null;
}
