import { useState, useMemo } from "react";
import type { StarlinkSatellite } from "@shared/types";
import { formatDate, getHealthColor, getHealthBgColor, formatNumber, getLaunchSiteName } from "../lib/utils";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from "lucide-react";

interface Props {
  satellites: StarlinkSatellite[];
}

type SortField = "name" | "healthScore" | "heightKm" | "ageInDays" | "version";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 25;

export function SatelliteTable({ satellites }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("healthScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [versionFilter, setVersionFilter] = useState<string>("all");

  const versions = useMemo(() => {
    const v = new Set(satellites.map((s) => s.version));
    return Array.from(v).sort();
  }, [satellites]);

  const filtered = useMemo(() => {
    let result = satellites;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.noradId.toString().includes(q) ||
          s.version.toLowerCase().includes(q)
      );
    }

    if (healthFilter !== "all") {
      result = result.filter((s) => s.healthStatus === healthFilter);
    }

    if (versionFilter !== "all") {
      result = result.filter((s) => s.version === versionFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "healthScore":
          aVal = a.healthScore;
          bVal = b.healthScore;
          break;
        case "heightKm":
          aVal = a.heightKm || 0;
          bVal = b.heightKm || 0;
          break;
        case "ageInDays":
          aVal = a.ageInDays;
          bVal = b.ageInDays;
          break;
        case "version":
          aVal = a.version;
          bVal = b.version;
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [satellites, search, sortField, sortDir, healthFilter, versionFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  return (
    <section className="mt-8" role="region" aria-label="Satellite catalog">
      <h3 className="text-sm font-mono text-gray-400 tracking-wider mb-5 uppercase">
        Satellite Catalog
      </h3>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or NORAD ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-spacex-blue outline-none"
            aria-label="Search satellites"
          />
        </div>
        <select
          value={healthFilter}
          onChange={(e) => {
            setHealthFilter(e.target.value);
            setPage(0);
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-spacex-blue"
          aria-label="Filter by health status"
        >
          <option value="all">All Health</option>
          <option value="nominal">Nominal</option>
          <option value="degraded">Degraded</option>
          <option value="critical">Critical</option>
          <option value="decayed">Decayed</option>
        </select>
        <select
          value={versionFilter}
          onChange={(e) => {
            setVersionFilter(e.target.value);
            setPage(0);
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-spacex-blue"
          aria-label="Filter by version"
        >
          <option value="all">All Versions</option>
          {versions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500 font-mono mb-3">
        {formatNumber(filtered.length)} SATELLITES | PAGE {page + 1} OF {totalPages}
      </p>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  { field: "name" as SortField, label: "SATELLITE" },
                  { field: "version" as SortField, label: "VERSION" },
                  { field: "healthScore" as SortField, label: "HEALTH" },
                  { field: "heightKm" as SortField, label: "ALTITUDE" },
                  { field: "ageInDays" as SortField, label: "AGE" },
                ].map(({ field, label }) => (
                  <th key={field} className="text-left px-4 py-3">
                    <button
                      className="flex items-center gap-1 text-xs font-mono text-gray-400 tracking-wider hover:text-white transition-colors"
                      onClick={() => toggleSort(field)}
                      aria-label={`Sort by ${label}`}
                    >
                      {label}
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-mono text-gray-400 tracking-wider">
                  LAUNCH DATE
                </th>
                <th className="text-left px-4 py-3 text-xs font-mono text-gray-400 tracking-wider">
                  LAUNCH SITE
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((sat) => (
                <tr
                  key={sat.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{sat.name}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        NORAD {sat.noradId}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-white/5 rounded text-xs font-mono text-gray-300">
                      {sat.version}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${getHealthBgColor(
                          sat.healthStatus
                        )} ${getHealthColor(sat.healthStatus)}`}
                      >
                        {sat.healthStatus.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {sat.healthScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                    {sat.heightKm ? `${sat.heightKm.toFixed(0)} km` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                    {sat.ageInDays > 0
                      ? `${Math.floor(sat.ageInDays / 365)}y ${sat.ageInDays % 365}d`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {formatDate(sat.launchDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {getLaunchSiteName(sat.site)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
            const p = startPage + i;
            if (p >= totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm font-mono ${
                  p === page
                    ? "bg-spacex-blue/30 text-spacex-accent"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                aria-label={`Page ${p + 1}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p + 1}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
