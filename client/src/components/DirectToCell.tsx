import { Smartphone, Signal } from "lucide-react";
import { formatNumber } from "../lib/utils";
import type { ConstellationStats } from "@shared/types";

export default function DirectToCell({ stats }: { stats: ConstellationStats }) {
  // v2 Mini satellites (2023+) have Direct-to-Cell hardware
  const d2cCount = stats.byVersion["v2.0-mini"] || 0;
  const totalActive = stats.activeSatellites;
  const d2cPct = totalActive > 0 ? ((d2cCount / totalActive) * 100).toFixed(1) : "0";

  return (
    <div className="card rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-spacex-blue/5 to-transparent rounded-bl-full" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <span className="section-label">Direct-to-Cell</span>
          <Smartphone className="w-3.5 h-3.5 text-white/15" />
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold text-white tabular-nums">{formatNumber(d2cCount)}</span>
          <span className="text-sm text-white/25">satellites</span>
        </div>
        <p className="text-[11px] text-white/20 mb-5">
          {d2cPct}% of active constellation · v2 Mini hardware
        </p>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <Signal className="w-4 h-4 text-spacex-accent/60" />
          <div>
            <p className="text-[12px] text-white/60 font-medium">Cellular Connectivity</p>
            <p className="text-[10px] text-white/25">LTE/5G direct-to-phone via T-Mobile partnership</p>
          </div>
        </div>
      </div>
    </div>
  );
}
