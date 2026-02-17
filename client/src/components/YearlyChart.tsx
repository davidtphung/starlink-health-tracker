import type { ConstellationStats } from "@shared/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  stats: ConstellationStats;
}

export function YearlyChart({ stats }: Props) {
  // Merge launches and satellites by year
  const allYears = new Set([
    ...Object.keys(stats.launchesByYear),
    ...Object.keys(stats.satellitesByYear),
  ]);

  const data = Array.from(allYears)
    .sort()
    .map((year) => ({
      year,
      launches: stats.launchesByYear[year] || 0,
      satellites: stats.satellitesByYear[year] || 0,
    }));

  // Calculate cumulative satellites
  let cumulative = 0;
  const cumulativeData = data.map((d) => {
    cumulative += d.satellites;
    return { ...d, cumulative };
  });

  return (
    <div className="glass rounded-xl p-6" role="region" aria-label="Year over year growth">
      <h3 className="text-sm font-mono text-gray-400 tracking-wider mb-5 uppercase">
        Year-Over-Year Growth
      </h3>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cumulativeData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(10,10,10,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#e5e7eb",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#a7d1f0" }}
            />
            <Bar
              dataKey="launches"
              fill="#005288"
              radius={[3, 3, 0, 0]}
              name="Launches"
            />
            <Bar
              dataKey="satellites"
              fill="#a7d1f0"
              radius={[3, 3, 0, 0]}
              name="Satellites Deployed"
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-spacex-blue" aria-hidden="true" />
          Launches
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-spacex-accent opacity-70" aria-hidden="true" />
          Satellites Deployed
        </span>
      </div>
    </div>
  );
}
