import { useLaunches, useStats } from "../hooks/useSatellites";
import { formatDateTime, formatNumber } from "../lib/utils";
import { Rocket, ExternalLink, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState, useMemo } from "react";
import type { SpaceXLaunch } from "@shared/types";
import { motion, AnimatePresence } from "framer-motion";

export default function Launches() {
  const { data: launches, isLoading } = useLaunches();
  const { data: stats } = useStats();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");

  const years = useMemo(() => {
    if (!launches) return [];
    const y = new Set(launches.map((l) => l.dateUtc.substring(0, 4)));
    return Array.from(y).sort((a, b) => b.localeCompare(a));
  }, [launches]);

  const filtered = useMemo(() => {
    if (!launches) return [];
    return launches.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.cores.some((c) => c.serial.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesYear = filterYear === "all" || l.dateUtc.startsWith(filterYear);
      return matchesSearch && matchesYear;
    });
  }, [launches, searchQuery, filterYear]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Rocket className="w-5 h-5 text-spacex-accent" aria-hidden="true" />
          <span className="text-xs font-mono text-spacex-accent tracking-widest uppercase">
            Mission History
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Starlink Launches
        </h2>
        <p className="text-gray-400 mt-2">
          Every Falcon 9 mission that deployed Starlink satellites, with booster and rocket details.
        </p>
      </div>

      {/* Launch Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4 stat-glow">
            <p className="text-xs text-gray-400 font-mono">TOTAL MISSIONS</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalStarlinkLaunches}</p>
          </div>
          <div className="glass rounded-xl p-4 stat-glow">
            <p className="text-xs text-gray-400 font-mono">UNIQUE BOOSTERS</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.uniqueBoosters}</p>
          </div>
          <div className="glass rounded-xl p-4 stat-glow">
            <p className="text-xs text-gray-400 font-mono">MOST FLOWN</p>
            <p className="text-2xl font-bold text-spacex-accent mt-1">
              {stats.mostFlownBooster?.serial || "N/A"}
            </p>
            <p className="text-xs text-gray-500">
              {stats.mostFlownBooster ? `${stats.mostFlownBooster.flights} flights` : ""}
            </p>
          </div>
          <div className="glass rounded-xl p-4 stat-glow">
            <p className="text-xs text-gray-400 font-mono">TOTAL DEPLOYED</p>
            <p className="text-2xl font-bold text-white mt-1">
              {formatNumber(stats.totalSatellites)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search missions or boosters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-spacex-blue focus:ring-1 focus:ring-spacex-blue outline-none transition-colors"
            aria-label="Search missions or boosters"
          />
        </div>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white appearance-none cursor-pointer outline-none focus:border-spacex-blue"
          aria-label="Filter by year"
        >
          <option value="all">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Launch List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-mono mb-4">
            {filtered.length} MISSION{filtered.length !== 1 ? "S" : ""} FOUND
          </p>
          {filtered.map((launch) => (
            <LaunchCard
              key={launch.id}
              launch={launch}
              expanded={expandedId === launch.id}
              onToggle={() => setExpandedId(expandedId === launch.id ? null : launch.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LaunchCardProps {
  launch: SpaceXLaunch;
  expanded: boolean;
  onToggle: () => void;
}

function LaunchCard({ launch, expanded, onToggle }: LaunchCardProps) {
  const statusIcon = launch.success === true
    ? <CheckCircle2 className="w-5 h-5 text-spacex-success" aria-label="Successful" />
    : launch.success === false
    ? <XCircle className="w-5 h-5 text-spacex-danger" aria-label="Failed" />
    : <Clock className="w-5 h-5 text-spacex-warning" aria-label="Pending" />;

  return (
    <div className="glass rounded-xl overflow-hidden transition-all hover:border-spacex-blue/30">
      {/* Main row */}
      <button
        className="w-full flex items-center gap-4 p-4 text-left"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`${launch.name} - ${launch.success ? "Successful" : launch.success === false ? "Failed" : "Pending"}`}
      >
        {statusIcon}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{launch.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateTime(launch.dateUtc)}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
          <span className="font-mono">{launch.rocketName}</span>
          {launch.cores[0] && (
            <span className="px-2 py-0.5 bg-white/5 rounded text-xs font-mono">
              {launch.cores[0].serial}
            </span>
          )}
          <span className="text-xs">Flight #{launch.flightNumber}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {/* Launch Site */}
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-1">LAUNCH SITE</p>
                  <p className="text-gray-200">{launch.launchpadName}</p>
                  <p className="text-xs text-gray-400">{launch.launchpadLocality}</p>
                </div>

                {/* Rocket */}
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-1">VEHICLE</p>
                  <p className="text-gray-200">{launch.rocketName}</p>
                  <p className="text-xs text-gray-400">Flight #{launch.flightNumber}</p>
                </div>

                {/* Payload */}
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-1">STARLINK PAYLOAD</p>
                  <p className="text-gray-200">{launch.starlinkCount} satellites</p>
                </div>

                {/* Booster Details */}
                {launch.cores.map((core, i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-500 font-mono mb-1">BOOSTER {i + 1}</p>
                    <p className="text-gray-200 font-mono">{core.serial}</p>
                    <p className="text-xs text-gray-400">
                      Flight {core.flight} | {core.reused ? "Reused" : "New"} |{" "}
                      {core.landingSuccess === true
                        ? `Landed (${core.landingType})`
                        : core.landingSuccess === false
                        ? "Landing Failed"
                        : "No Landing Attempt"}
                    </p>
                  </div>
                ))}

                {/* Mission Details */}
                {launch.details && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-gray-500 font-mono mb-1">MISSION NOTES</p>
                    <p className="text-gray-300 text-sm">{launch.details}</p>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex gap-3 mt-4 pt-3 border-t border-white/5">
                {launch.links.webcast && (
                  <a
                    href={launch.links.webcast}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-spacex-accent hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Webcast
                  </a>
                )}
                {launch.links.article && (
                  <a
                    href={launch.links.article}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-spacex-accent hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Article
                  </a>
                )}
                {launch.links.wikipedia && (
                  <a
                    href={launch.links.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-spacex-accent hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Wikipedia
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
