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
    <div className="px-phi-4 sm:px-phi-5 lg:px-phi-6 py-phi-6 sm:py-phi-7">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
          <Rocket className="w-4 h-4 text-white/30" aria-hidden="true" />
          <span className="text-[11px] font-medium text-white/30 tracking-[0.12em] uppercase">
            Mission History
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.1]">
          Starlink Launches
        </h2>
        <p className="text-white/35 mt-3 text-base max-w-xl">
          Every Falcon 9 mission that deployed Starlink satellites.
        </p>
      </div>

      {/* Launch Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card rounded-xl p-5">
            <p className="text-[11px] text-white/25 tracking-wide uppercase font-medium">Total Missions</p>
            <p className="text-2xl font-semibold text-white mt-1.5 tabular-nums">{stats.totalStarlinkLaunches}</p>
          </div>
          <div className="card rounded-xl p-5">
            <p className="text-[11px] text-white/25 tracking-wide uppercase font-medium">Unique Boosters</p>
            <p className="text-2xl font-semibold text-white mt-1.5 tabular-nums">{stats.uniqueBoosters}</p>
          </div>
          <div className="card rounded-xl p-5">
            <p className="text-[11px] text-white/25 tracking-wide uppercase font-medium">Most Flown</p>
            <p className="text-2xl font-semibold text-white mt-1.5">
              {stats.mostFlownBooster?.serial || "N/A"}
            </p>
            <p className="text-[11px] text-white/20 mt-0.5">
              {stats.mostFlownBooster ? `${stats.mostFlownBooster.flights} flights` : ""}
            </p>
          </div>
          <div className="card rounded-xl p-5">
            <p className="text-[11px] text-white/25 tracking-wide uppercase font-medium">Total Deployed</p>
            <p className="text-2xl font-semibold text-white mt-1.5 tabular-nums">
              {formatNumber(stats.totalSatellites)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search missions or boosters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-white/20 focus:border-white/15 focus:ring-0 outline-none transition-colors"
            aria-label="Search missions or boosters"
          />
        </div>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white appearance-none cursor-pointer outline-none focus:border-white/15"
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
        <div className="space-y-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/[0.02]" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-white/20 tracking-wide uppercase font-medium mb-4">
            {filtered.length} mission{filtered.length !== 1 ? "s" : ""} found
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
    ? <CheckCircle2 className="w-4 h-4 text-spacex-success" aria-label="Successful" />
    : launch.success === false
    ? <XCircle className="w-4 h-4 text-spacex-danger" aria-label="Failed" />
    : <Clock className="w-4 h-4 text-spacex-warning" aria-label="Pending" />;

  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-4 text-left"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`${launch.name} - ${launch.success ? "Successful" : launch.success === false ? "Failed" : "Pending"}`}
      >
        {statusIcon}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm truncate">{launch.name}</h3>
          <p className="text-[11px] text-white/25 mt-0.5">
            {formatDateTime(launch.dateUtc)}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-sm text-white/30">
          <span className="text-[13px]">{launch.rocketName}</span>
          {launch.cores[0] && (
            <span className="px-2 py-0.5 bg-white/[0.04] rounded text-[10px] font-mono">
              {launch.cores[0].serial}
            </span>
          )}
          <span className="text-[11px] tabular-nums">#{launch.flightNumber}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-white/15 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/15 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 border-t border-white/[0.04] pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-white/20 tracking-wide uppercase font-medium mb-1">Launch Site</p>
                  <p className="text-white/70">{launch.launchpadName}</p>
                  <p className="text-[11px] text-white/25">{launch.launchpadLocality}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/20 tracking-wide uppercase font-medium mb-1">Vehicle</p>
                  <p className="text-white/70">{launch.rocketName}</p>
                  <p className="text-[11px] text-white/25">Flight #{launch.flightNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/20 tracking-wide uppercase font-medium mb-1">Payload</p>
                  <p className="text-white/70">{launch.starlinkCount} satellites</p>
                </div>
                {launch.cores.map((core, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-white/20 tracking-wide uppercase font-medium mb-1">Booster {i + 1}</p>
                    <p className="text-white/70 font-mono text-[13px]">{core.serial}</p>
                    <p className="text-[11px] text-white/25">
                      Flight {core.flight} | {core.reused ? "Reused" : "New"} |{" "}
                      {core.landingSuccess === true
                        ? `Landed (${core.landingType})`
                        : core.landingSuccess === false
                        ? "Landing Failed"
                        : "No Landing Attempt"}
                    </p>
                  </div>
                ))}
                {launch.details && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-[10px] text-white/20 tracking-wide uppercase font-medium mb-1">Notes</p>
                    <p className="text-white/40 text-[13px] leading-relaxed">{launch.details}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-4 pt-3 border-t border-white/[0.04]">
                {launch.links.webcast && (
                  <a href={launch.links.webcast} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/50 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Webcast
                  </a>
                )}
                {launch.links.article && (
                  <a href={launch.links.article} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/50 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Article
                  </a>
                )}
                {launch.links.wikipedia && (
                  <a href={launch.links.wikipedia} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/50 transition-colors">
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
