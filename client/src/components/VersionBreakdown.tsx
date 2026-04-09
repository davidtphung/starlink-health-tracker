import { motion } from "framer-motion";
import { Cpu, Radio, Wifi } from "lucide-react";
import type { ConstellationStats } from "@shared/types";
import { formatNumber } from "../lib/utils";

const VERSION_META: Record<string, { label: string; shortLabel: string; color: string; icon: typeof Cpu; desc: string }> = {
  "v1.0":       { label: "v1.0", shortLabel: "V1", color: "text-white/50", icon: Cpu, desc: "2019–2021 · Original flat-panel" },
  "v1.5":       { label: "v1.5", shortLabel: "V1.5", color: "text-spacex-accent", icon: Radio, desc: "2021–2022 · Laser interlinks" },
  "v2.0-mini":  { label: "v2 Mini", shortLabel: "V2", color: "text-white", icon: Wifi, desc: "2023+ · Direct-to-Cell capable" },
  "prototype":  { label: "Proto", shortLabel: "P", color: "text-white/25", icon: Cpu, desc: "2018–2019 · Test satellites" },
  "unknown":    { label: "Other", shortLabel: "?", color: "text-white/15", icon: Cpu, desc: "Unclassified" },
};

export default function VersionBreakdown({ stats }: { stats: ConstellationStats }) {
  const versions = Object.entries(stats.byVersion)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0);

  const total = versions.reduce((s, [_, c]) => s + c, 0);

  return (
    <div className="card rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="section-label">Satellite Versions</span>
        <span className="text-[11px] text-white/15 tabular-nums">{formatNumber(total)} total</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden mb-5 bg-white/[0.03]">
        {versions.map(([version, count]) => {
          const meta = VERSION_META[version] || VERSION_META["unknown"];
          const pct = total > 0 ? (count / total) * 100 : 0;
          const barColor = version === "v2.0-mini" ? "bg-white" : version === "v1.5" ? "bg-spacex-accent/60" : version === "v1.0" ? "bg-white/30" : "bg-white/10";
          return (
            <div key={version} className={barColor} style={{ width: `${pct}%` }} title={`${meta.label}: ${formatNumber(count)}`} />
          );
        })}
      </div>

      {/* Version rows */}
      <div className="space-y-3">
        {versions.slice(0, 4).map(([version, count], i) => {
          const meta = VERSION_META[version] || VERSION_META["unknown"];
          const Icon = meta.icon;
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
          return (
            <motion.div
              key={version}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <Icon className={`w-3.5 h-3.5 ${meta.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                  <span className="text-sm font-semibold text-white tabular-nums">{formatNumber(count)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-white/20">{meta.desc}</span>
                  <span className="text-[10px] text-white/20 tabular-nums">{pct}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
