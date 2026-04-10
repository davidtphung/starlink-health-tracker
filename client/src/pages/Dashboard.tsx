import { useStats, useFunFacts, useLaunches } from "../hooks/useSatellites";
import { Link } from "wouter";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import {
  Satellite, Activity, Flame, Mountain, Rocket, Globe,
  Shield, AlertTriangle, XCircle, ArrowRight, Zap, ExternalLink,
  Scale, Clock, Repeat, Layers, BarChart3,
} from "lucide-react";
import type { ConstellationStats, FunFact, SpaceXLaunch } from "@shared/types";
import { formatNumber, formatDate } from "../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import VersionBreakdown from "../components/VersionBreakdown";
import DirectToCell from "../components/DirectToCell";
import AgeAnalysis from "../components/AgeAnalysis";
import LaunchTimeline from "../components/LaunchTimeline";
import GlobePreview from "../components/GlobePreview";

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
    <div className="px-phi-4 sm:px-phi-5 lg:px-phi-6 py-phi-6 sm:py-phi-7 space-y-10">
      {/* Hero */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-spacex-success animate-pulse" aria-hidden="true" />
          <span className="text-[11px] font-medium text-spacex-success tracking-[0.12em] uppercase">
            Live Constellation Data
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
          <span className="text-white">Starlink</span>{" "}
          <span className="text-white/40">Health Monitor</span>
        </h2>
        <p className="text-white/35 mt-3 text-base sm:text-lg max-w-xl leading-relaxed">
          Real-time tracking of SpaceX's satellite constellation.
        </p>
      </section>

      {/* Key Metrics — 6 cards */}
      {stats && <HeroStats stats={stats} />}

      {/* Row 2: Health + Globe CTA + Growth Chart */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <HealthCard stats={stats} />
          <GlobePreview activeCount={stats.activeSatellites} />
          <GrowthMiniChart stats={stats} />
        </div>
      )}

      {/* Row 3: Version Breakdown + Direct-to-Cell + Age Analysis */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <VersionBreakdown stats={stats} />
          <DirectToCell stats={stats} />
          <AgeAnalysis />
        </div>
      )}

      {/* Row 4: Launch Groups + Recent Missions + Social (3-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {launches && <LaunchTimeline launches={launches} />}
        <div className="lg:col-span-1">
          {launches && <RecentLaunches launches={launches} />}
        </div>
        <div className="space-y-5">
          <SocialCard
            handle="@SpaceX"
            url="https://x.com/SpaceX"
            description="Launch livestreams, mission updates, and Starship news"
            label="SpaceX"
          />
          <SocialCard
            handle="@Starlink"
            url="https://x.com/Starlink"
            description="Service updates, coverage expansion, and milestones"
            label="Starlink"
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
    { label: "Total Tracked", value: stats.totalSatellites, icon: Satellite, color: "text-white", href: "/globe" },
    { label: "Active in Orbit", value: stats.activeSatellites, icon: Activity, color: "text-spacex-success", href: "/globe" },
    { label: "Decayed", value: stats.decayedSatellites, icon: Flame, color: "text-spacex-warning", href: "/globe" },
    { label: "Avg Altitude", value: stats.avgAltitudeKm, icon: Mountain, color: "text-white", suffix: " km", href: "/globe" },
    { label: "Missions Flown", value: stats.totalStarlinkLaunches, icon: Rocket, color: "text-white", href: "/launches" },
    { label: "Unique Boosters", value: stats.uniqueBoosters, icon: Layers, color: "text-white", href: "/launches" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" role="region" aria-label="Key metrics">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
            <Link href={card.href}>
              <div className="card rounded-xl p-5 cursor-pointer group">
                <Icon className="w-4 h-4 text-white/20 mb-3" aria-hidden="true" />
                <p className={`text-2xl sm:text-3xl font-semibold ${card.color} tabular-nums`}>
                  <CountUp end={card.value} duration={1.2} separator="," preserveValue />
                  {card.suffix && <span className="text-lg text-white/30">{card.suffix}</span>}
                </p>
                <p className="text-[11px] text-white/30 tracking-wide mt-1.5 uppercase font-medium">{card.label}</p>
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
      <div className="card rounded-xl p-6 cursor-pointer group h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <span className="section-label">Constellation Health</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-5xl font-bold text-spacex-success tabular-nums">{nominalPct}</span>
            <span className="text-lg text-spacex-success/60">%</span>
            <span className="text-xs text-white/25 ml-1">nominal</span>
          </div>
        </div>
        <div>
          <div className="flex h-1.5 rounded-full overflow-hidden mb-4 bg-white/[0.03]">
            {health.map((h) => (
              <div key={h.label} className={h.color} style={{ width: `${total > 0 ? (h.count / total) * 100 : 0}%` }} />
            ))}
          </div>
          <div className="flex gap-5">
            {health.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.label} className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${h.text} opacity-60`} aria-hidden="true" />
                  <span className="text-xs text-white/40 tabular-nums">{formatNumber(h.count)}</span>
                </div>
              );
            })}
          </div>
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
    <div className="card rounded-xl p-6 md:col-span-2 lg:col-span-1">
      <div className="flex items-center justify-between mb-5">
        <span className="section-label">Yearly Growth</span>
        <BarChart3 className="w-3.5 h-3.5 text-white/15" aria-hidden="true" />
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "rgba(0,0,0,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e5e7eb", fontFamily: "Inter", fontSize: "11px" }} />
            <Bar dataKey="sats" fill="rgba(167,209,240,0.6)" radius={[3, 3, 0, 0]} name="Satellites" />
            <Bar dataKey="launches" fill="rgba(0,82,136,0.8)" radius={[3, 3, 0, 0]} name="Launches" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-5 mt-3 text-[10px] text-white/25">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-spacex-accent/60" aria-hidden="true" />Satellites</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-spacex-blue/80" aria-hidden="true" />Launches</span>
      </div>
    </div>
  );
}

function RecentLaunches({ launches }: { launches: SpaceXLaunch[] }) {
  const recent = launches.slice(0, 5);
  return (
    <div className="card rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="section-label">Recent Missions</span>
        <Link href="/launches"><span className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/50 cursor-pointer transition-colors">View all <ArrowRight className="w-3 h-3" /></span></Link>
      </div>
      <div className="space-y-0.5">
        {recent.map((l) => (
          <Link key={l.id} href="/launches">
            <div className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${l.success ? "bg-spacex-success" : l.success === false ? "bg-spacex-danger" : "bg-spacex-warning"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{l.name}</p>
                <p className="text-[11px] text-white/25 mt-0.5">{formatDate(l.dateUtc)}</p>
              </div>
              <span className="text-[11px] text-white/15 tabular-nums font-mono">#{l.flightNumber}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SocialCard({ handle, url, description, label }: { handle: string; url: string; description: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="card rounded-xl p-6 block group" aria-label={`Follow ${handle} on X`}>
      <div className="flex items-center justify-between mb-4">
        <span className="section-label">{label}</span>
        <ExternalLink className="w-3 h-3 text-white/10 group-hover:text-white/30 transition-colors" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.07] transition-colors">
          <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <p className="text-white font-medium text-sm">{handle}</p>
      </div>
      <p className="text-[13px] text-white/30 leading-relaxed">{description}</p>
    </a>
  );
}

function FunFactsStrip({ facts }: { facts: FunFact[] }) {
  return (
    <section role="region" aria-label="Fun facts">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-3.5 h-3.5 text-spacex-gold/60" aria-hidden="true" />
        <span className="section-label">Fun Facts</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {facts.slice(0, 4).map((fact, i) => {
          const Icon = iconMap[fact.icon] || Zap;
          return (
            <motion.div key={fact.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }} className="card rounded-xl p-5">
              <Icon className="w-4 h-4 text-spacex-gold/40 mb-3" aria-hidden="true" />
              <p className="text-[10px] text-white/25 tracking-wide mb-1 uppercase font-medium">{fact.label}</p>
              <p className="text-base font-semibold text-white">{fact.value}</p>
              <p className="text-[11px] text-white/20 leading-relaxed mt-1.5 hidden sm:block">{fact.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="px-phi-4 sm:px-phi-5 lg:px-phi-6 py-phi-6 sm:py-phi-7 space-y-10 animate-pulse">
      <div className="h-24 rounded-xl bg-white/[0.02]" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-white/[0.02]" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <div key={i} className="h-56 rounded-xl bg-white/[0.02]" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-white/[0.02]" />)}
      </div>
    </div>
  );
}
