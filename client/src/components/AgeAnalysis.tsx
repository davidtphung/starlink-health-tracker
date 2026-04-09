import { useSatellites } from "../hooks/useSatellites";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";
import { Clock } from "lucide-react";
import { useMemo } from "react";
import { formatNumber } from "../lib/utils";

export default function AgeAnalysis() {
  const { data: satellites } = useSatellites();

  const { histogram, avgAge, medianAge, oldestAge, healthVsAge } = useMemo(() => {
    if (!satellites) return { histogram: [], avgAge: 0, medianAge: 0, oldestAge: 0, healthVsAge: [] };

    const active = satellites.filter((s) => s.status === "active" && s.ageInDays > 0);

    // Age histogram — buckets of 6 months
    const buckets: Record<string, number> = {};
    active.forEach((s) => {
      const months = Math.floor(s.ageInDays / 182.5);
      const label = months <= 0 ? "<6mo" : months >= 10 ? "5y+" : `${months * 6}–${(months + 1) * 6}mo`;
      buckets[label] = (buckets[label] || 0) + 1;
    });
    const histogram = Object.entries(buckets)
      .map(([label, count]) => ({ label, count }))
      .slice(0, 12);

    // Stats
    const ages = active.map((s) => s.ageInDays).sort((a, b) => a - b);
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0;
    const medianAge = ages.length > 0 ? ages[Math.floor(ages.length / 2)] : 0;
    const oldestAge = ages.length > 0 ? ages[ages.length - 1] : 0;

    // Health vs Age scatter — sample 200 for performance
    const step = Math.max(1, Math.ceil(active.length / 200));
    const healthVsAge = active
      .filter((_, i) => i % step === 0)
      .map((s) => ({
        age: Math.round(s.ageInDays / 30), // months
        health: s.healthScore,
        name: s.name,
      }));

    return { histogram, avgAge, medianAge, oldestAge, healthVsAge };
  }, [satellites]);

  if (!satellites) return null;

  return (
    <div className="card rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="section-label">Constellation Age</span>
        <Clock className="w-3.5 h-3.5 text-white/15" />
      </div>

      {/* Age stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-[10px] text-white/20 uppercase tracking-wide font-medium">Average</p>
          <p className="text-lg font-semibold text-white tabular-nums">{(avgAge / 365).toFixed(1)}<span className="text-sm text-white/25">y</span></p>
        </div>
        <div>
          <p className="text-[10px] text-white/20 uppercase tracking-wide font-medium">Median</p>
          <p className="text-lg font-semibold text-white tabular-nums">{(medianAge / 365).toFixed(1)}<span className="text-sm text-white/25">y</span></p>
        </div>
        <div>
          <p className="text-[10px] text-white/20 uppercase tracking-wide font-medium">Oldest</p>
          <p className="text-lg font-semibold text-white tabular-nums">{(oldestAge / 365).toFixed(1)}<span className="text-sm text-white/25">y</span></p>
        </div>
      </div>

      {/* Age distribution histogram */}
      <p className="text-[10px] text-white/20 uppercase tracking-wide font-medium mb-2">Age Distribution</p>
      <div className="h-28 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogram}>
            <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "rgba(0,0,0,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e5e7eb", fontFamily: "Inter", fontSize: "11px" }}
              formatter={(v: number) => [formatNumber(v), "Satellites"]}
            />
            <Bar dataKey="count" fill="rgba(255,255,255,0.15)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Health vs Age scatter */}
      <p className="text-[10px] text-white/20 uppercase tracking-wide font-medium mb-2">Health Score vs Age (months)</p>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <XAxis dataKey="age" tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9 }} axisLine={false} tickLine={false} name="Age (months)" />
            <YAxis dataKey="health" tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} name="Health %" />
            <ZAxis range={[8, 8]} />
            <Tooltip
              contentStyle={{ background: "rgba(0,0,0,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e5e7eb", fontFamily: "Inter", fontSize: "11px" }}
              formatter={(v: number, name: string) => [name === "health" ? `${v}%` : `${v}mo`, name === "health" ? "Health" : "Age"]}
            />
            <Scatter data={healthVsAge} fill="rgba(167,209,240,0.4)" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
