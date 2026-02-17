import { Satellite, Activity, Flame, Mountain } from "lucide-react";
import { formatNumber } from "../lib/utils";
import CountUp from "react-countup";
import type { ConstellationStats } from "@shared/types";

interface Props {
  stats: ConstellationStats;
}

export function StatsOverview({ stats }: Props) {
  const cards = [
    {
      label: "Total Satellites",
      value: stats.totalSatellites,
      icon: Satellite,
      color: "text-spacex-accent",
      suffix: "",
    },
    {
      label: "Active in Orbit",
      value: stats.activeSatellites,
      icon: Activity,
      color: "text-spacex-success",
      suffix: "",
    },
    {
      label: "Decayed / Deorbited",
      value: stats.decayedSatellites,
      icon: Flame,
      color: "text-spacex-warning",
      suffix: "",
    },
    {
      label: "Avg. Altitude",
      value: stats.avgAltitudeKm,
      icon: Mountain,
      color: "text-spacex-accent",
      suffix: " km",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Constellation statistics">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="glass rounded-xl p-5 stat-glow">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${card.color}`} aria-hidden="true" />
              <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                {card.label}
              </span>
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>
              <CountUp
                end={card.value}
                duration={2}
                separator=","
                preserveValue
              />
              {card.suffix}
            </p>
          </div>
        );
      })}
    </div>
  );
}
