import { useSatellites, useStats, useFunFacts } from "../hooks/useSatellites";
import { StatsOverview } from "../components/StatsOverview";
import { HealthBreakdown } from "../components/HealthBreakdown";
import { SatelliteTable } from "../components/SatelliteTable";
import { FunFactsSection } from "../components/FunFactsSection";
import { YearlyChart } from "../components/YearlyChart";
import { Satellite, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: satellites, isLoading: satsLoading } = useSatellites();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: funFacts, isLoading: factsLoading } = useFunFacts();

  const isLoading = satsLoading || statsLoading;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-spacex-success animate-pulse" aria-hidden="true" />
          <span className="text-xs font-mono text-spacex-success tracking-widest uppercase">
            Live Constellation Data
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="gradient-text">Starlink</span>{" "}
          <span className="text-white">Health Monitor</span>
        </h2>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Real-time tracking of SpaceX's Starlink satellite constellation.
          Orbital health, mission data, and launch history from public telemetry sources.
        </p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Cards */}
          {stats && <StatsOverview stats={stats} />}

          {/* Health + Yearly Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {stats && <HealthBreakdown stats={stats} />}
            {stats && <YearlyChart stats={stats} />}
          </div>

          {/* Fun Facts */}
          {funFacts && <FunFactsSection facts={funFacts} />}

          {/* Satellite Table */}
          {satellites && <SatelliteTable satellites={satellites} />}
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-white/5" />
        <div className="h-64 rounded-xl bg-white/5" />
      </div>
      <div className="h-96 rounded-xl bg-white/5" />
    </div>
  );
}
