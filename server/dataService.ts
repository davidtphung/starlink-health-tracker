import type {
  StarlinkSatellite,
  SpaceXLaunch,
  ConstellationStats,
  FunFact,
  CoreInfo,
} from "../shared/types.js";

// CelesTrak OMM JSON format
interface CelesTrakGP {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  EPOCH: string;
  MEAN_MOTION: number;
  ECCENTRICITY: number;
  INCLINATION: number;
  RA_OF_ASC_NODE: number;
  ARG_OF_PERICENTER: number;
  MEAN_ANOMALY: number;
  NORAD_CAT_ID: number;
  BSTAR: number;
  MEAN_MOTION_DOT: number;
  MEAN_MOTION_DDOT: number;
  SEMIMAJOR_AXIS: number;
  PERIOD: number;
  APOAPSIS: number;
  PERIAPSIS: number;
  OBJECT_TYPE: string;
  RCS_SIZE: string;
  COUNTRY_CODE: string;
  LAUNCH_DATE: string;
  SITE: string;
  DECAY_DATE: string | null;
  DECAYED: number;
  REV_AT_EPOCH: number;
  TLE_LINE0: string;
  TLE_LINE1: string;
  TLE_LINE2: string;
}

// SpaceX API types
interface SpaceXStarlink {
  id: string;
  version: string;
  launch: string;
  longitude: number | null;
  latitude: number | null;
  height_km: number | null;
  velocity_kms: number | null;
  spaceTrack: {
    OBJECT_NAME: string;
    NORAD_CAT_ID: number;
    LAUNCH_DATE: string;
    DECAY_DATE: string | null;
    DECAYED: number;
    EPOCH: string;
    MEAN_MOTION: number;
    ECCENTRICITY: number;
    INCLINATION: number;
    BSTAR: number;
    SEMIMAJOR_AXIS: number;
    PERIOD: number;
    APOAPSIS: number;
    PERIAPSIS: number;
    OBJECT_TYPE: string;
    RCS_SIZE: string;
    SITE: string;
  };
}

interface SpaceXLaunchRaw {
  id: string;
  flight_number: number;
  name: string;
  date_utc: string;
  date_local: string;
  success: boolean | null;
  details: string | null;
  rocket: string;
  launchpad: string;
  cores: Array<{
    core: string | null;
    flight: number | null;
    gridfins: boolean | null;
    legs: boolean | null;
    reused: boolean | null;
    landing_attempt: boolean | null;
    landing_success: boolean | null;
    landing_type: string | null;
  }>;
  payloads: string[];
  links: {
    webcast: string | null;
    article: string | null;
    wikipedia: string | null;
    patch: { small: string | null; large: string | null } | null;
  };
}

interface SpaceXCore {
  id: string;
  serial: string;
  block: number | null;
  status: string;
  reuse_count: number;
  launches: string[];
}

interface SpaceXRocket {
  id: string;
  name: string;
}

interface SpaceXLaunchpad {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
}

interface SpaceXPayload {
  id: string;
  name: string;
  type: string;
  orbit: string;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class DataService {
  private cache = new Map<string, CacheEntry<unknown>>();

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data as T;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getSatellites(): Promise<StarlinkSatellite[]> {
    const cached = this.getCached<StarlinkSatellite[]>("satellites");
    if (cached) return cached;

    // Fetch from both SpaceX API and CelesTrak in parallel
    // SpaceX has launch/version data, CelesTrak has up-to-date orbital elements
    const [spacexRes, celestrakRes] = await Promise.all([
      fetch("https://api.spacexdata.com/v4/starlink").catch(() => null),
      fetch("https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json").catch(() => null),
    ]);

    const now = Date.now();
    const spacexData: SpaceXStarlink[] = spacexRes?.ok ? await spacexRes.json() : [];
    const celestrakData: CelesTrakGP[] = celestrakRes?.ok ? await celestrakRes.json() : [];

    // Build lookup from SpaceX data by NORAD ID for version/launch info
    const spacexByNorad = new Map<number, SpaceXStarlink>();
    for (const s of spacexData) {
      if (s.spaceTrack?.NORAD_CAT_ID) {
        spacexByNorad.set(s.spaceTrack.NORAD_CAT_ID, s);
      }
    }

    // Build lookup from CelesTrak by NORAD ID for fresh orbital data
    const celestrakByNorad = new Map<number, CelesTrakGP>();
    for (const c of celestrakData) {
      celestrakByNorad.set(c.NORAD_CAT_ID, c);
    }

    // Merge: use CelesTrak as the primary list (most complete and up to date),
    // enrich with SpaceX version/position data
    const allNoradIds = new Set([
      ...celestrakByNorad.keys(),
      ...spacexByNorad.keys(),
    ]);

    const satellites: StarlinkSatellite[] = [];
    for (const noradId of allNoradIds) {
      const ct = celestrakByNorad.get(noradId);
      const sx = spacexByNorad.get(noradId);

      // Must have at least one source
      if (!ct && !sx?.spaceTrack) continue;

      const objectName = ct?.OBJECT_NAME || sx?.spaceTrack?.OBJECT_NAME || `UNKNOWN-${noradId}`;
      // Skip non-Starlink objects
      if (!objectName.toUpperCase().includes("STARLINK")) continue;

      const rawLaunchDate = ct?.LAUNCH_DATE || sx?.spaceTrack?.LAUNCH_DATE || "";
      const launchDate = rawLaunchDate && rawLaunchDate !== "0000-00-00" ? rawLaunchDate : null;
      const ageInDays = launchDate
        ? Math.floor((now - new Date(launchDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const decayDate = ct?.DECAY_DATE || sx?.spaceTrack?.DECAY_DATE || null;
      const decayed = (ct?.DECAYED === 1) || (sx?.spaceTrack?.DECAYED === 1) || decayDate !== null;
      const status: StarlinkSatellite["status"] = decayed ? "decayed" : "active";

      const bstar = ct?.BSTAR ?? sx?.spaceTrack?.BSTAR ?? 0;
      const eccentricity = ct?.ECCENTRICITY ?? sx?.spaceTrack?.ECCENTRICITY ?? 0;
      const periapsis = ct?.PERIAPSIS ?? sx?.spaceTrack?.PERIAPSIS ?? 550;
      const healthScore = computeHealthScore(bstar, eccentricity, periapsis, decayed, ageInDays);
      const healthStatus = getHealthStatus(healthScore, decayed);

      // Determine version from SpaceX data or infer from launch date / object ID
      let version = sx?.version || "unknown";
      if (version === "unknown") {
        // Try to infer from launch date
        if (launchDate) {
          const ld = new Date(launchDate);
          const launchYear = ld.getFullYear();
          const launchMonth = ld.getMonth();
          if (launchYear >= 2024 || (launchYear === 2023 && launchMonth >= 1)) version = "v2.0-mini";
          else if (launchYear >= 2022 || (launchYear === 2021 && launchMonth >= 8)) version = "v1.5";
          else if (launchYear >= 2019) version = "v1.0";
          else version = "prototype";
        } else {
          // Infer from OBJECT_ID international designator (yyyy-nnn)
          const objId = ct?.OBJECT_ID || "";
          const idYear = parseInt(objId.substring(0, 4));
          if (idYear >= 2024 || idYear === 2023) version = "v2.0-mini";
          else if (idYear === 2022 || idYear === 2021) version = "v1.5";
          else if (idYear >= 2019) version = "v1.0";
          else if (idYear > 0) version = "prototype";
          // For sats with no identifiable date, infer from NORAD ID range
          else if (noradId >= 58000) version = "v2.0-mini";
          else if (noradId >= 48000) version = "v1.5";
          else if (noradId >= 44000) version = "v1.0";
        }
      }

      satellites.push({
        id: sx?.id || `ct-${noradId}`,
        name: objectName,
        noradId,
        version,
        status,
        latitude: sx?.latitude ?? null,
        longitude: sx?.longitude ?? null,
        heightKm: sx?.height_km ?? (ct ? (ct.APOAPSIS + ct.PERIAPSIS) / 2 : null),
        velocityKms: sx?.velocity_kms ?? null,
        inclination: ct?.INCLINATION ?? sx?.spaceTrack?.INCLINATION ?? 0,
        eccentricity,
        period: ct?.PERIOD ?? sx?.spaceTrack?.PERIOD ?? 0,
        apoapsis: ct?.APOAPSIS ?? sx?.spaceTrack?.APOAPSIS ?? 0,
        periapsis,
        meanMotion: ct?.MEAN_MOTION ?? sx?.spaceTrack?.MEAN_MOTION ?? 0,
        bstar,
        epoch: ct?.EPOCH ?? sx?.spaceTrack?.EPOCH ?? "",
        launchDate,
        decayDate,
        objectType: ct?.OBJECT_TYPE ?? sx?.spaceTrack?.OBJECT_TYPE ?? "PAYLOAD",
        rcsSize: ct?.RCS_SIZE ?? sx?.spaceTrack?.RCS_SIZE ?? "MEDIUM",
        site: ct?.SITE ?? sx?.spaceTrack?.SITE ?? "AFETR",
        objectId: ct?.OBJECT_ID || "",
        launchId: sx?.launch || null,
        healthScore,
        healthStatus,
        ageInDays,
      });
    }

    this.setCache("satellites", satellites);
    return satellites;
  }

  async getLaunches(): Promise<SpaceXLaunch[]> {
    const cached = this.getCached<SpaceXLaunch[]>("launches");
    if (cached) return cached;

    // Fetch launches, cores, rockets, launchpads, payloads in parallel
    const [launchesRes, coresRes, rocketsRes, launchpadsRes, payloadsRes] = await Promise.all([
      fetch("https://api.spacexdata.com/v4/launches"),
      fetch("https://api.spacexdata.com/v4/cores"),
      fetch("https://api.spacexdata.com/v4/rockets"),
      fetch("https://api.spacexdata.com/v4/launchpads"),
      fetch("https://api.spacexdata.com/v4/payloads"),
    ]);

    const [rawLaunches, cores, rockets, launchpads, payloads]: [
      SpaceXLaunchRaw[],
      SpaceXCore[],
      SpaceXRocket[],
      SpaceXLaunchpad[],
      SpaceXPayload[],
    ] = await Promise.all([
      launchesRes.json(),
      coresRes.json(),
      rocketsRes.json(),
      launchpadsRes.json(),
      payloadsRes.json(),
    ]);

    const coreMap = new Map(cores.map((c) => [c.id, c]));
    const rocketMap = new Map(rockets.map((r) => [r.id, r]));
    const launchpadMap = new Map(launchpads.map((l) => [l.id, l]));

    // Filter Starlink launches
    const starlinkLaunches = rawLaunches.filter((l) => {
      const launchPayloads = l.payloads
        .map((pid) => payloads.find((p) => p.id === pid))
        .filter(Boolean);
      return (
        l.name.toLowerCase().includes("starlink") ||
        launchPayloads.some(
          (p) =>
            p!.name.toLowerCase().includes("starlink") ||
            p!.type?.toLowerCase().includes("starlink")
        )
      );
    });

    const launches: SpaceXLaunch[] = starlinkLaunches.map((l) => {
      const rocket = rocketMap.get(l.rocket);
      const launchpad = launchpadMap.get(l.launchpad);

      const coreInfos: CoreInfo[] = l.cores
        .filter((c) => c.core)
        .map((c) => {
          const coreData = coreMap.get(c.core!);
          return {
            serial: coreData?.serial || "Unknown",
            flight: c.flight || 1,
            reused: c.reused || false,
            landingSuccess: c.landing_success,
            landingType: c.landing_type,
          };
        });

      // Count starlink sats in this launch's payloads
      const starlinkPayloads = l.payloads
        .map((pid) => payloads.find((p) => p.id === pid))
        .filter((p) => p && p.name.toLowerCase().includes("starlink"));

      return {
        id: l.id,
        flightNumber: l.flight_number,
        name: l.name,
        dateUtc: l.date_utc,
        dateLocal: l.date_local,
        success: l.success,
        details: l.details,
        rocketId: l.rocket,
        rocketName: rocket?.name || "Falcon 9",
        launchpadId: l.launchpad,
        launchpadName: launchpad?.full_name || launchpad?.name || "Unknown",
        launchpadLocality: launchpad?.locality || "Unknown",
        cores: coreInfos,
        starlinkCount: starlinkPayloads.length || estimateStarlinkCount(l.name),
        links: {
          webcast: l.links.webcast,
          article: l.links.article,
          wikipedia: l.links.wikipedia,
          patch: l.links.patch?.small || null,
        },
      };
    });

    // Also fetch from Launch Library 2 for more recent launches (post-2022)
    try {
      const ll2Res = await fetch(
        "https://ll.thespacedevs.com/2.2.0/launch/?search=starlink&limit=100&ordering=-net&format=json",
        { signal: AbortSignal.timeout(10000) }
      );
      if (ll2Res.ok) {
        const ll2Data = await ll2Res.json();
        const existingDates = new Set(launches.map((l) => l.dateUtc.substring(0, 10)));

        for (const ll2Launch of ll2Data.results || []) {
          const dateStr = ll2Launch.net;
          if (!dateStr) continue;
          const dateKey = dateStr.substring(0, 10);
          // Skip if we already have this launch from SpaceX API
          if (existingDates.has(dateKey)) continue;
          if (!ll2Launch.name?.toLowerCase().includes("starlink")) continue;

          const boosterSerial = ll2Launch.rocket?.configuration?.full_name
            ? ll2Launch.rocket.configuration.full_name
            : "Falcon 9";

          // Extract booster info from launcher data if available
          const ll2Cores: CoreInfo[] = [];
          if (ll2Launch.rocket?.launcher_stage) {
            for (const stage of ll2Launch.rocket.launcher_stage) {
              if (stage.launcher?.serial_number) {
                ll2Cores.push({
                  serial: stage.launcher.serial_number,
                  flight: stage.launcher.flights || 1,
                  reused: (stage.launcher.flights || 1) > 1,
                  landingSuccess: stage.landing?.success ?? null,
                  landingType: stage.landing?.type?.abbrev || null,
                });
              }
            }
          }

          launches.push({
            id: ll2Launch.id || `ll2-${dateKey}`,
            flightNumber: 0,
            name: ll2Launch.name,
            dateUtc: dateStr,
            dateLocal: dateStr,
            success: ll2Launch.status?.id === 3 ? true : ll2Launch.status?.id === 4 ? false : null,
            details: ll2Launch.mission?.description || null,
            rocketId: "",
            rocketName: ll2Launch.rocket?.configuration?.name || "Falcon 9",
            launchpadId: "",
            launchpadName: ll2Launch.pad?.name || "Unknown",
            launchpadLocality: ll2Launch.pad?.location?.name || "Unknown",
            cores: ll2Cores,
            starlinkCount: estimateStarlinkCount(ll2Launch.name),
            links: {
              webcast: ll2Launch.vidURLs?.[0]?.url || null,
              article: null,
              wikipedia: ll2Launch.wiki_url || null,
              patch: ll2Launch.image || null,
            },
          });
        }
      }
    } catch (err) {
      // LL2 is supplementary; continue without it
      console.warn("LL2 API unavailable:", err);
    }

    // Sort by date descending (newest first)
    launches.sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime());

    this.setCache("launches", launches);
    return launches;
  }

  async getConstellationStats(): Promise<ConstellationStats> {
    const cached = this.getCached<ConstellationStats>("stats");
    if (cached) return cached;

    const [satellites, launches] = await Promise.all([
      this.getSatellites(),
      this.getLaunches(),
    ]);

    const activeSats = satellites.filter((s) => s.status === "active");
    const decayedSats = satellites.filter((s) => s.status === "decayed");

    const byVersion: Record<string, number> = {};
    const byHealthStatus: Record<string, number> = {};
    const satellitesByYear: Record<string, number> = {};
    let totalAlt = 0;
    let altCount = 0;
    let totalAge = 0;
    let ageCount = 0;

    for (const sat of satellites) {
      const v = sat.version || "unknown";
      byVersion[v] = (byVersion[v] || 0) + 1;
      byHealthStatus[sat.healthStatus] = (byHealthStatus[sat.healthStatus] || 0) + 1;

      if (sat.heightKm && sat.status === "active") {
        totalAlt += sat.heightKm;
        altCount++;
      }
      if (sat.ageInDays > 0) {
        totalAge += sat.ageInDays;
        ageCount++;
      }
      // Determine launch year from launchDate or OBJECT_ID international designator
      let launchYear: string | null = null;
      if (sat.launchDate) {
        launchYear = sat.launchDate.substring(0, 4);
      } else if (sat.objectId) {
        // OBJECT_ID format: "2023-042A" — extract year
        const idYear = sat.objectId.substring(0, 4);
        if (/^\d{4}$/.test(idYear) && parseInt(idYear) >= 2018) {
          launchYear = idYear;
        }
      }
      if (launchYear) {
        satellitesByYear[launchYear] = (satellitesByYear[launchYear] || 0) + 1;
      }
    }

    const launchesByYear: Record<string, number> = {};
    const boosterSet = new Set<string>();
    const boosterFlights: Record<string, number> = {};

    for (const l of launches) {
      const year = l.dateUtc.substring(0, 4);
      launchesByYear[year] = (launchesByYear[year] || 0) + 1;
      for (const c of l.cores) {
        if (c.serial && c.serial !== "Unknown") {
          boosterSet.add(c.serial);
          boosterFlights[c.serial] = (boosterFlights[c.serial] || 0) + 1;
        }
      }
    }

    let mostFlownBooster: { serial: string; flights: number } | null = null;
    for (const [serial, flights] of Object.entries(boosterFlights)) {
      if (!mostFlownBooster || flights > mostFlownBooster.flights) {
        mostFlownBooster = { serial, flights };
      }
    }

    const stats: ConstellationStats = {
      totalSatellites: satellites.length,
      activeSatellites: activeSats.length,
      decayedSatellites: decayedSats.length,
      avgAltitudeKm: altCount > 0 ? Math.round(totalAlt / altCount) : 550,
      avgAge: ageCount > 0 ? Math.round(totalAge / ageCount) : 0,
      byVersion,
      byHealthStatus,
      totalLaunches: launches.length,
      totalStarlinkLaunches: launches.length,
      uniqueBoosters: boosterSet.size,
      mostFlownBooster,
      launchesByYear,
      satellitesByYear,
    };

    this.setCache("stats", stats);
    return stats;
  }

  async getFunFacts(): Promise<FunFact[]> {
    const cached = this.getCached<FunFact[]>("funfacts");
    if (cached) return cached;

    const [satellites, launches, stats] = await Promise.all([
      this.getSatellites(),
      this.getLaunches(),
      this.getConstellationStats(),
    ]);

    const activeSats = satellites.filter((s) => s.status === "active");

    // Find oldest active satellite
    const oldestActive = activeSats.reduce(
      (oldest, s) => (s.ageInDays > (oldest?.ageInDays || 0) ? s : oldest),
      null as StarlinkSatellite | null
    );

    // Find highest satellite
    const highest = activeSats.reduce(
      (h, s) => ((s.heightKm || 0) > (h?.heightKm || 0) ? s : h),
      null as StarlinkSatellite | null
    );

    // Find most used launch site
    const siteCount: Record<string, number> = {};
    for (const l of launches) {
      siteCount[l.launchpadLocality] = (siteCount[l.launchpadLocality] || 0) + 1;
    }
    const topSite = Object.entries(siteCount).sort((a, b) => b[1] - a[1])[0];

    // Calculate total mass launched (approx 260kg per v1.0, 800kg per v2mini)
    const totalMass = satellites.reduce((sum, s) => {
      if (s.version?.includes("2")) return sum + 800;
      if (s.version?.includes("1.5")) return sum + 300;
      return sum + 260;
    }, 0);

    const facts: FunFact[] = [
      {
        label: "Total Mass in Orbit",
        value: `${(totalMass / 1000).toFixed(0)} tonnes`,
        description: "Estimated total mass of all Starlink satellites currently tracked",
        icon: "scale",
      },
      {
        label: "Oldest Active Satellite",
        value: oldestActive
          ? `${Math.floor(oldestActive.ageInDays / 365)}y ${oldestActive.ageInDays % 365}d`
          : "N/A",
        description: oldestActive ? `${oldestActive.name} launched ${oldestActive.launchDate}` : "",
        icon: "clock",
      },
      {
        label: "Highest Altitude",
        value: highest ? `${highest.heightKm?.toFixed(0)} km` : "N/A",
        description: highest ? `${highest.name} orbiting at peak altitude` : "",
        icon: "mountain",
      },
      {
        label: "Busiest Launch Site",
        value: topSite ? topSite[0] : "N/A",
        description: topSite ? `${topSite[1]} Starlink launches from this location` : "",
        icon: "rocket",
      },
      {
        label: "Most Flown Booster",
        value: stats.mostFlownBooster ? stats.mostFlownBooster.serial : "N/A",
        description: stats.mostFlownBooster
          ? `${stats.mostFlownBooster.flights} Starlink missions on this booster`
          : "",
        icon: "repeat",
      },
      {
        label: "Orbital Speed",
        value: "~7.5 km/s",
        description: "Each Starlink satellite travels at approximately 27,000 km/h",
        icon: "zap",
      },
      {
        label: "Coverage Area",
        value: "~60 countries",
        description: "Starlink provides internet coverage across six continents",
        icon: "globe",
      },
      {
        label: "Unique Boosters Used",
        value: `${stats.uniqueBoosters}`,
        description: "Different Falcon 9 first stages used for Starlink missions",
        icon: "layers",
      },
    ];

    this.setCache("funfacts", facts);
    return facts;
  }
}

function computeHealthScore(
  bstar: number,
  eccentricity: number,
  periapsis: number,
  isDecayed: boolean,
  ageInDays: number
): number {
  if (isDecayed) return 0;

  let score = 100;

  // BSTAR drag term - higher absolute value = more drag = worse health
  const absBstar = Math.abs(bstar);
  if (absBstar > 0.01) score -= 40;
  else if (absBstar > 0.001) score -= 20;
  else if (absBstar > 0.0001) score -= 10;

  // Eccentricity - circular orbit is ideal (0), higher = worse
  if (eccentricity > 0.01) score -= 20;
  else if (eccentricity > 0.005) score -= 10;
  else if (eccentricity > 0.001) score -= 5;

  // Periapsis - below ~300km is very bad, operational orbit is ~550km
  if (periapsis < 200) score -= 40;
  else if (periapsis < 350) score -= 25;
  else if (periapsis < 500) score -= 10;

  // Age penalty - older satellites degrade
  if (ageInDays > 1825) score -= 10; // > 5 years
  else if (ageInDays > 1095) score -= 5; // > 3 years

  return Math.max(0, Math.min(100, score));
}

function getHealthStatus(
  score: number,
  isDecayed: boolean
): StarlinkSatellite["healthStatus"] {
  if (isDecayed) return "decayed";
  if (score >= 75) return "nominal";
  if (score >= 50) return "degraded";
  return "critical";
}

function estimateStarlinkCount(missionName: string): number {
  // v2 Mini missions typically carry ~21-23 sats
  // v1.0 missions carried ~60 sats
  // v1.5 missions carried ~52-53 sats
  if (missionName.toLowerCase().includes("v2")) return 21;
  if (missionName.toLowerCase().includes("group 6") || missionName.toLowerCase().includes("group 7"))
    return 23;
  return 52;
}
