import type { ConstellationStats } from "@shared/types";
import { Shield, AlertTriangle, XCircle, Skull } from "lucide-react";
import { formatNumber } from "../lib/utils";

interface Props {
  stats: ConstellationStats;
}

export function HealthBreakdown({ stats }: Props) {
  const healthData = [
    {
      label: "Nominal",
      count: stats.byHealthStatus["nominal"] || 0,
      color: "bg-spacex-success",
      textColor: "text-spacex-success",
      icon: Shield,
    },
    {
      label: "Degraded",
      count: stats.byHealthStatus["degraded"] || 0,
      color: "bg-spacex-warning",
      textColor: "text-spacex-warning",
      icon: AlertTriangle,
    },
    {
      label: "Critical",
      count: stats.byHealthStatus["critical"] || 0,
      color: "bg-spacex-danger",
      textColor: "text-spacex-danger",
      icon: XCircle,
    },
    {
      label: "Decayed",
      count: stats.byHealthStatus["decayed"] || 0,
      color: "bg-gray-500",
      textColor: "text-gray-500",
      icon: Skull,
    },
  ];

  const total = healthData.reduce((sum, h) => sum + h.count, 0);

  // Version breakdown
  const versions = Object.entries(stats.byVersion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="glass rounded-xl p-phi-5" role="region" aria-label="Health breakdown">
      <h3 className="text-sm font-mono text-gray-400 tracking-wider mb-phi-5 uppercase">
        Constellation Health
      </h3>

      {/* Health Bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-phi-5" role="img" aria-label="Health distribution bar">
        {healthData.map((h) => (
          <div
            key={h.label}
            className={`${h.color} transition-all duration-500`}
            style={{ width: `${total > 0 ? (h.count / total) * 100 : 0}%` }}
            title={`${h.label}: ${formatNumber(h.count)}`}
          />
        ))}
      </div>

      {/* Health Legend */}
      <div className="grid grid-cols-2 gap-phi-3 mb-phi-5">
        {healthData.map((h) => {
          const Icon = h.icon;
          return (
            <div key={h.label} className="flex items-center gap-phi-3">
              <Icon className={`w-4 h-4 ${h.textColor}`} aria-hidden="true" />
              <div>
                <p className="text-sm text-white">{h.label}</p>
                <p className={`text-lg font-bold font-mono ${h.textColor}`}>
                  {formatNumber(h.count)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Version Breakdown */}
      <div className="border-t border-white/5 pt-phi-4">
        <h4 className="text-xs font-mono text-gray-500 mb-phi-3 tracking-wider">BY VERSION</h4>
        <div className="space-y-phi-2">
          {versions.map(([version, count]) => (
            <div key={version} className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-mono">{version}</span>
              <div className="flex items-center gap-phi-3">
                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-spacex-blue rounded-full"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 font-mono w-16 text-right">
                  {formatNumber(count)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
