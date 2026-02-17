import { useStats, useFunFacts, useLaunches } from "../hooks/useSatellites";
import { Link } from "wouter";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import {
  Satellite, Activity, Flame, Mountain, Rocket, Globe,
  Shield, AlertTriangle, XCircle, ArrowRight, Zap, ExternalLink,
  Scale, Clock, Repeat, Layers, ChevronRight, BarChart3,
} from "lucide-react";
import type { ConstellationStats, FunFact, SpaceXLaunch } from "@shared/types";
import { formatNumber, formatDate } from "../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const iconMap: Record<string, typeof Zap> = {
  scale: Scale, clock: Clock, mountain: Mountain, rocket: Rocket,
  repeat: Repeat, zap: Zap, globe: Globe, layers: Layers,
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: funFacts } = useFunFacts();
  const { data: launches } = useLaunches();

  if (statsLoading) return <DashboardSkeleton />;

  return (
    <div className="px-phi-4 sm:px-phi-5 lg:px-phi-6 py-phi-5 sm:py-phi-6 space-y-phi-5 sm:space-y-phi-6">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-phi-3 mb-phi-2">
          <div className="w-2 h-2 rounded-full bg-spacex-success animate-pulse" aria-hidden="true" />
          <span className="text-[10px] sm:text-xs font-mono text-spacex-success tracking-widest uppercase">
            Live Constellation Data
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
          <span className="gradient-text">Starlink</span>{" "}
          <span className="text-white">Health Monitor</span>
        </h2>
        <p className="text-gray-500 mt-phi-2 sm:mt-phi-3 text-base max-w-2xl">
          Real-time tracking of SpaceX's Starlink satellite constellation.
        </p>
      </div>

      {/* Big Stat Cards */}
      {stats && <HeroStats stats={stats} />}

      {/* Middle: Health + Globe CTA + Growth Chart */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-phi-4 sm:gap-phi-5">
          <HealthCard stats={stats} />
          <GlobeCTA stats={stats} />
          <GrowthMiniChart stats={stats} />
        </div>
      )}

      {/* Bottom: Recent Launches + Social Feeds (golden ratio split) */}
      <div className="flex flex-col lg:flex-row gap-phi-4 sm:gap-phi-5">
        <div className="golden-major">
          {launches && <RecentLaunches launches={launches} />}
        </div>
        <div className="golden-minor space-y-phi-4 sm:space-y-phi-5">
          <SocialCard
            handle="@SpaceX"
            url="https://x.com/SpaceX"
            description="Follow for launch livestreams, mission updates, and Starship news"
            label="SPACEX LIVE"
          />
          <SocialCard
            handle="@Starlink"
            url="https://x.com/Starlink"
            description="Service updates, coverage expansion, and constellation milestones"
            label="STARLINK UPDATES"
          />
        </div>
      </div>

      {/* Fun Facts */}
      {funFacts && <FunFactsStrip facts={funFacts} />}
    </div>
  );
}

function HeroStats({ stats }: { stats: ConstellationStats }) {
  const cards = [
    { label: "Total Tracked", value: stats.totalSatellites, icon: Satellite, color: "text-spacex-accent", href: "/globe" },
    { label: "Active in Orbit", value: stats.activeSatellites, icon: Activity, color: "text-spacex-success", href: "/globe" },
    { label: "Decayed", value: stats.decayedSatellites, icon: Flame, color: "text-spacex-warning", href: "/globe" },
    { label: "Avg Altitude", value: stats.avgAltitudeKm, icon: Mountain, color: "text-spacex-accent", suffix: " km", href: "/globe" },
    { label: "Missions Flown", value: stats.totalStarlinkLaunches, icon: Rocket, color: "text-white", href: "/launches" },
    { label: "Unique Boosters", value: stats.uniqueBoosters, icon: Layers, color: "text-spacex-gold", href: "/launches" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-phi-3 sm:gap-phi-4" role="region" aria-label="Key metrics">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Link href={card.href}>
              <div className="glass rounded-xl p-phi-4 sm:p-phi-5 stat-glow cursor-pointer group hover:border-spacex-blue/30 transition-all">
                <div className="flex items-center justify-between mb-phi-2">
                  <Icon className={`w-4 h-4 ${card.color} opacity-70`} aria-hidden="true" />
                  <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-spacex-accent transition-colors" aria-hidden="true" />
                </div>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${card.color} font-mono`}>
                  <CountUp end={card.value} duration={1.5} separator="," preserveValue />
                  {card.suffix || ""}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 font-mono tracking-wider mt-phi-1 uppercase">
                  {card.label}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

function HealthCard({ stats }: { stats: ConstellationStats }) {
  const health = [
    { label: "Nominal", count: stats.byHealthStatus["nominal"] || 0, color: "bg-spacex-success", text: "text-spacex-success", icon: Shield },
    { label: "Degraded", count: stats.byHealthStatus["degraded"] || 0, color: "bg-spacex-warning", text: "text-spacex-warning", icon: AlertTriangle },
    { label: "Critical", count: stats.byHealthStatus["critical"] || 0, color: "bg-spacex-danger", text: "text-spacex-danger", icon: XCircle },
  ];
  const total = health.reduce((s, h) => s + h.count, 0);
  const nominalPct = total > 0 ? ((health[0].count / total) * 100).toFixed(1) : "0";

  return (
    <Link href="/globe">
      <div className="glass rounded-xl p-phi-5 sm:p-phi-6 cursor-pointer group hover:border-spacex-blue/30 transition-all h-full">
        <div className="flex items-center justify-between mb-phi-4">
          <h3 className="text-xs font-mono text-gray-400 tracking-wider uppercase">Constellation Health</h3>
          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-spacex-accent transition-colors" />
        </div>
        <div className="flex items-baseline gap-phi-2 mb-phi-4">
          <span className="text-4xl sm:text-5xl font-bold text-spacex-success font-mono">{nominalPct}%</span>
          <span className="text-xs text-gray-500">nominal</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden mb-phi-4">
          {health.map((h) => (
            <div key={h.label} className={`${h.color}`} style={{ width: `${total > 0 ? (h.count / total) * 100 : 0}%` }} />
          ))}
        </div>
        <div className="flex gap-phi-4 sm:gap-phi-5">
          {health.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.label} className="flex items-center gap-phi-1">
                <Icon className={`w-3 h-3 ${h.text}`} aria-hidden="true" />
                <span className="text-xs text-gray-400">{formatNumber(h.count)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

function GlobeCTA({ stats }: { stats: ConstellationStats }) {
  return (
    <Link href="/globe">
      <div className="glass rounded-xl p-phi-5 sm:p-phi-6 cursor-pointer group hover:border-spacex-blue/30 transition-all h-full flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-spacex-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-phi-4">
            <h3 className="text-xs font-mono text-gray-400 tracking-wider uppercase">3D Globe View</h3>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-spacex-accent transition-colors" />
          </div>
          <Globe className="w-16 h-16 sm:w-20 sm:h-20 text-spacex-blue/40 mx-auto my-phi-4 group-hover:text-spacex-blue/60 transition-colors animate-spin-slow" aria-hidden="true" />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-lg sm:text-xl font-bold text-white font-mono">
            {formatNumber(stats.activeSatellites)}
          </p>
          <p className="text-xs text-gray-500">satellites visualized in real-time</p>
        </div>
      </div>
    </Link>
  );
}

function GrowthMiniChart({ stats }: { stats: ConstellationStats }) {
  const allYears = new Set([...Object.keys(stats.launchesByYear), ...Object.keys(stats.satellitesByYear)]);
  const data = Array.from(allYears).sort().map((year) => ({
    year: "'" + year.slice(2),
    sats: stats.satellitesByYear[year] || 0,
    launches: stats.launchesByYear[year] || 0,
  }));

  return (
    <div className="glass rounded-xl p-phi-5 sm:p-phi-6 md:col-span-2 lg:col-span-1">
      <div className="flex items-center justify-between mb-phi-4">
        <h3 className="text-xs font-mono text-gray-400 tracking-wider uppercase">Yearly Growth</h3>
        <BarChart3 className="w-4 h-4 text-gray-600" aria-hidden="true" />
      </div>
      <div className="h-40 sm:h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={1}>
            <XAxis
              dataKey="year"
              tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#e5e7eb",
                fontFamily: "JetBrains Mono",
                fontSize: "11px",
              }}
            />
            <Bar dataKey="sats" fill="#a7d1f0" radius={[2, 2, 0, 0]} name="Satellites" opacity={0.8} />
            <Bar dataKey="launches" fill="#005288" radius={[2, 2, 0, 0]} name="Launches" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-phi-4 mt-phi-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-phi-1"><span className="w-2 h-2 rounded bg-spacex-accent/80" aria-hidden="true" />Satellites</span>
        <span className="flex items-center gap-phi-1"><span className="w-2 h-2 rounded bg-spacex-blue" aria-hidden="true" />Launches</span>
      </div>
    </div>
  );
}

function RecentLaunches({ launches }: { launches: SpaceXLaunch[] }) {
  const recent = launches.slice(0, 5);

  return (
    <div className="glass rounded-xl p-phi-5 sm:p-phi-6">
      <div className="flex items-center justify-between mb-phi-4">
        <h3 className="text-xs font-mono text-gray-400 tracking-wider uppercase">Recent Missions</h3>
        <Link href="/launches">
          <span className="flex items-center gap-phi-1 text-xs text-spacex-accent hover:underline cursor-pointer">
            View all <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      <div className="space-y-phi-1">
        {recent.map((l) => (
          <Link key={l.id} href="/launches">
            <div className="flex items-center gap-phi-3 sm:gap-phi-4 p-phi-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${l.success ? "bg-spacex-success" : l.success === false ? "bg-spacex-danger" : "bg-spacex-warning"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate font-medium">{l.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{formatDate(l.dateUtc)}</p>
              </div>
              <div className="hidden sm:flex items-center gap-phi-2">
                {l.cores[0] && (
                  <span className="px-phi-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-gray-400">
                    {l.cores[0].serial}
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-gray-600">#{l.flightNumber}</span>
              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-spacex-accent flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SocialCard({ handle, url, description, label }: { handle: string; url: string; description: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass rounded-xl p-phi-5 sm:p-phi-6 block group hover:border-spacex-blue/30 transition-all"
      aria-label={`Follow ${handle} on X`}
    >
      <div className="flex items-center justify-between mb-phi-3">
        <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">{label}</span>
        <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-spacex-accent transition-colors" />
      </div>
      <div className="flex items-center gap-phi-3 mb-phi-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{handle}</p>
          <p className="text-[10px] text-gray-500">on X (Twitter)</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      <div className="mt-phi-3 flex items-center gap-phi-2 text-xs text-spacex-accent group-hover:underline">
        Follow for updates <ArrowRight className="w-3 h-3" />
      </div>
    </a>
  );
}

function FunFactsStrip({ facts }: { facts: FunFact[] }) {
  return (
    <section role="region" aria-label="Fun facts">
      <h3 className="text-xs font-mono text-gray-400 tracking-wider mb-phi-4 uppercase flex items-center gap-phi-2">
        <Zap className="w-3.5 h-3.5 text-spacex-gold" aria-hidden="true" />
        Fun Facts
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-phi-3 sm:gap-phi-4">
        {facts.slice(0, 4).map((fact, i) => {
          const Icon = iconMap[fact.icon] || Zap;
          return (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="glass rounded-xl p-phi-4 hover:border-spacex-gold/20 transition-colors"
            >
              <Icon className="w-4 h-4 text-spacex-gold mb-phi-2" aria-hidden="true" />
              <p className="text-[10px] text-gray-500 font-mono tracking-wider mb-0.5">{fact.label}</p>
              <p className="text-sm sm:text-base font-bold text-white">{fact.value}</p>
              <p className="text-[10px] text-gray-500 leading-relaxed mt-phi-1 hidden sm:block">{fact.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="px-phi-4 sm:px-phi-5 lg:px-phi-6 py-phi-5 sm:py-phi-6 space-y-phi-5 animate-pulse">
      <div className="h-20 rounded-xl bg-white/[0.03]" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-phi-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/[0.03]" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-phi-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-52 rounded-xl bg-white/[0.03]" />)}
      </div>
      <div className="flex flex-col lg:flex-row gap-phi-4">
        <div className="golden-major h-64 rounded-xl bg-white/[0.03]" />
        <div className="golden-minor h-64 rounded-xl bg-white/[0.03]" />
      </div>
    </div>
  );
}
