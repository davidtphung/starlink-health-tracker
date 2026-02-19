import { useLiveLaunch } from "../hooks/useSatellites";
import { useState, useEffect, useMemo } from "react";
import { Radio, ExternalLink, Clock, MapPin, Rocket, Play, ChevronRight } from "lucide-react";
import type { WebcastLink } from "@shared/types";

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, Math.floor((target - now) / 1000));

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (diff <= 0) {
    return (
      <div className="text-spacex-accent font-mono text-lg tracking-wider">
        T-00:00:00
      </div>
    );
  }

  return (
    <div className="flex items-center gap-phi-4">
      <span className="text-xs text-gray-500 font-mono">T-MINUS</span>
      <div className="flex gap-phi-3">
        {days > 0 && (
          <TimeUnit value={days} label="DAYS" />
        )}
        <TimeUnit value={hours} label="HRS" />
        <TimeUnit value={minutes} label="MIN" />
        <TimeUnit value={seconds} label="SEC" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] text-gray-500 font-mono tracking-widest">{label}</div>
    </div>
  );
}

function getWebcastIcon(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("youtube")) return "YouTube";
  if (s.includes("x.com") || s.includes("twitter")) return "X";
  if (s.includes("spacex")) return "SpaceX";
  return source;
}

function WebcastButton({ webcast }: { webcast: WebcastLink }) {
  return (
    <a
      href={webcast.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-phi-2 px-phi-4 py-phi-3 rounded-lg text-sm font-medium transition-all ${
        webcast.live
          ? "bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30"
          : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
      }`}
    >
      {webcast.live ? (
        <Radio className="w-4 h-4 animate-pulse" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      <span>{webcast.live ? "WATCH LIVE" : getWebcastIcon(webcast.source)}</span>
      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
    </a>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-phi-1 px-phi-3 py-1 rounded-full bg-red-600/20 border border-red-500/30">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-mono text-red-400 tracking-wider">LIVE</span>
    </span>
  );
}

function YouTubeEmbed({ url }: { url: string }) {
  const videoId = useMemo(() => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        return u.searchParams.get("v") || u.pathname.split("/").pop();
      }
      if (u.hostname === "youtu.be") {
        return u.pathname.slice(1);
      }
    } catch {
      // not a youtube URL
    }
    return null;
  }, [url]);

  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
        title="Launch Webcast"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export default function Live() {
  const { data, isLoading } = useLiveLaunch();

  if (isLoading) {
    return (
      <div className="px-phi-4 sm:px-phi-5 lg:px-phi-6 py-phi-6">
        <div className="animate-pulse space-y-phi-5">
          <div className="h-8 w-48 bg-white/5 rounded" />
          <div className="h-64 bg-white/5 rounded-xl" />
          <div className="h-32 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  const nextLaunch = data?.nextLaunch;
  const isLive = data?.isLiveNow || false;
  const recentLaunches = data?.recentPastLaunches || [];

  // Find the best embeddable webcast (YouTube preferred for embedding)
  const youtubeWebcast = nextLaunch?.webcasts.find((w) =>
    w.url.includes("youtube.com") || w.url.includes("youtu.be")
  );

  return (
    <div className="px-phi-4 sm:px-phi-5 lg:px-phi-6 py-phi-6">
      {/* Header */}
      <div className="mb-phi-6">
        <div className="flex items-center gap-phi-3 mb-phi-2">
          <Radio className="w-5 h-5 text-spacex-accent" aria-hidden="true" />
          <span className="text-xs font-mono text-spacex-accent tracking-widest uppercase">
            Launch Broadcast
          </span>
          {isLive && <LiveBadge />}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {isLive ? "Live Now" : "Next Starlink Launch"}
        </h2>
      </div>

      {nextLaunch ? (
        <div className="space-y-phi-5">
          {/* Main launch card */}
          <div className="glass rounded-xl overflow-hidden">
            {/* Embedded video or hero image */}
            {isLive && youtubeWebcast ? (
              <YouTubeEmbed url={youtubeWebcast.url} />
            ) : nextLaunch.image ? (
              <div className="relative w-full aspect-video sm:aspect-[21/9] overflow-hidden">
                <img
                  src={nextLaunch.image}
                  alt={nextLaunch.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-phi-5 left-phi-5 right-phi-5">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-phi-2">
                    {nextLaunch.name}
                  </h3>
                  <div className="flex items-center gap-phi-3 text-sm text-gray-300">
                    <span className="font-mono">{nextLaunch.rocketName}</span>
                    {nextLaunch.booster && (
                      <span className="px-phi-2 py-0.5 bg-white/10 rounded text-xs font-mono">
                        {nextLaunch.booster.serial} | Flight {nextLaunch.booster.flights}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="p-phi-5">
              {/* Mission name (if no hero image showed it) */}
              {!nextLaunch.image && (
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-phi-4">
                  {nextLaunch.name}
                </h3>
              )}

              {/* Countdown */}
              <div className="glass rounded-xl p-phi-5 mb-phi-5">
                <CountdownTimer targetDate={nextLaunch.net} />
              </div>

              {/* Mission details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-phi-4 mb-phi-5">
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-phi-1">STATUS</p>
                  <p className={`font-medium ${
                    isLive ? "text-red-400" :
                    nextLaunch.status === "Go" ? "text-spacex-success" :
                    nextLaunch.status === "TBD" || nextLaunch.status === "TBC" ? "text-spacex-warning" :
                    "text-gray-300"
                  }`}>
                    {isLive ? "IN PROGRESS" : nextLaunch.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-phi-1">VEHICLE</p>
                  <p className="text-gray-200">{nextLaunch.rocketName}</p>
                  {nextLaunch.booster && (
                    <p className="text-xs text-gray-400 font-mono">
                      {nextLaunch.booster.serial} | Flight {nextLaunch.booster.flights}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-phi-1">LAUNCH SITE</p>
                  <p className="text-gray-200 flex items-center gap-phi-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {nextLaunch.padName}
                  </p>
                  <p className="text-xs text-gray-400">{nextLaunch.padLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-phi-1">LAUNCH TIME</p>
                  <p className="text-gray-200">
                    {new Date(nextLaunch.net).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {new Date(nextLaunch.net).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Mission description */}
              {nextLaunch.missionDescription && (
                <div className="mb-phi-5">
                  <p className="text-xs text-gray-500 font-mono mb-phi-2">MISSION NOTES</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {nextLaunch.missionDescription}
                  </p>
                </div>
              )}

              {/* Webcast links */}
              {nextLaunch.webcasts.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-phi-3">
                    {isLive ? "WATCH NOW" : "WEBCAST LINKS"}
                  </p>
                  <div className="flex flex-wrap gap-phi-3">
                    {nextLaunch.webcasts.map((w, i) => (
                      <WebcastButton key={i} webcast={w} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass rounded-xl p-phi-5 text-center">
                  <Radio className="w-8 h-8 text-gray-600 mx-auto mb-phi-3" />
                  <p className="text-sm text-gray-400 mb-phi-2">
                    No webcast links available yet
                  </p>
                  <p className="text-xs text-gray-500">
                    SpaceX typically streams on{" "}
                    <a
                      href="https://x.com/SpaceX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-spacex-accent hover:underline"
                    >
                      @SpaceX on X
                    </a>
                    {" "}shortly before launch
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SpaceX X account CTA */}
          <a
            href="https://x.com/SpaceX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-phi-4 glass rounded-xl p-phi-4 hover:border-spacex-blue/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">𝕏</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Follow @SpaceX for live updates</p>
              <p className="text-xs text-gray-400">SpaceX streams launches exclusively on X</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-spacex-accent transition-colors" />
          </a>
        </div>
      ) : (
        /* No upcoming launch data */
        <div className="glass rounded-xl p-phi-6 text-center">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-phi-4" />
          <h3 className="text-xl font-bold text-white mb-phi-2">
            No Upcoming Starlink Launch Scheduled
          </h3>
          <p className="text-sm text-gray-400 mb-phi-4">
            Follow{" "}
            <a
              href="https://x.com/SpaceX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-spacex-accent hover:underline"
            >
              @SpaceX
            </a>{" "}
            for launch announcements
          </p>
        </div>
      )}

      {/* Recent past launches with replay links */}
      {recentLaunches.length > 0 && (
        <div className="mt-phi-6">
          <h3 className="text-sm font-mono text-gray-400 tracking-wider mb-phi-4 uppercase">
            Recent Mission Replays
          </h3>
          <div className="space-y-phi-3">
            {recentLaunches.map((launch) => (
              <div
                key={launch.id}
                className="glass rounded-xl p-phi-4 flex items-center gap-phi-4"
              >
                {launch.image && (
                  <img
                    src={launch.image}
                    alt={launch.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{launch.name}</h4>
                  <p className="text-xs text-gray-400">
                    {new Date(launch.net).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" "}
                    <span className={
                      launch.status === "Success" ? "text-spacex-success" :
                      launch.status === "Failure" ? "text-spacex-danger" :
                      "text-gray-500"
                    }>
                      {launch.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-phi-2 flex-shrink-0">
                  {launch.webcasts.length > 0 ? (
                    launch.webcasts.slice(0, 2).map((w, i) => (
                      <a
                        key={i}
                        href={w.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-phi-1 px-phi-3 py-phi-2 bg-white/5 rounded-lg text-xs text-spacex-accent hover:bg-white/10 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Replay
                      </a>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 font-mono">No replay</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
