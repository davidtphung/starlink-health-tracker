import { useMemo } from "react";
import { CheckCircle2, XCircle, Clock, Layers } from "lucide-react";
import { formatNumber } from "../lib/utils";
import type { SpaceXLaunch } from "@shared/types";
import { motion } from "framer-motion";

interface LaunchGroup {
  group: string;
  launches: SpaceXLaunch[];
  totalSats: number;
  firstDate: string;
  lastDate: string;
  successRate: number;
}

export default function LaunchTimeline({ launches }: { launches: SpaceXLaunch[] }) {
  const groups = useMemo(() => {
    // Extract group number from mission name: "Starlink Group X-Y" → "Group X"
    const groupMap = new Map<string, SpaceXLaunch[]>();

    for (const l of launches) {
      const match = l.name.match(/Group\s+(\d+)/i);
      const groupKey = match ? `Group ${match[1]}` : "Other";
      if (!groupMap.has(groupKey)) groupMap.set(groupKey, []);
      groupMap.get(groupKey)!.push(l);
    }

    const result: LaunchGroup[] = [];
    for (const [group, groupLaunches] of groupMap) {
      const sorted = [...groupLaunches].sort((a, b) => new Date(a.dateUtc).getTime() - new Date(b.dateUtc).getTime());
      const successCount = sorted.filter((l) => l.success === true).length;
      result.push({
        group,
        launches: sorted,
        totalSats: sorted.reduce((s, l) => s + l.starlinkCount, 0),
        firstDate: sorted[0].dateUtc,
        lastDate: sorted[sorted.length - 1].dateUtc,
        successRate: sorted.length > 0 ? (successCount / sorted.length) * 100 : 0,
      });
    }

    // Sort by group number
    return result.sort((a, b) => {
      const aNum = parseInt(a.group.replace("Group ", "")) || 999;
      const bNum = parseInt(b.group.replace("Group ", "")) || 999;
      return aNum - bNum;
    });
  }, [launches]);

  return (
    <div className="card rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="section-label">Launch Groups</span>
        <Layers className="w-3.5 h-3.5 text-white/15" />
      </div>

      <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
        {groups.map((g, i) => {
          const dateRange = formatCompactDate(g.firstDate) + (g.launches.length > 1 ? ` – ${formatCompactDate(g.lastDate)}` : "");
          return (
            <motion.div
              key={g.group}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              {/* Group indicator */}
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-semibold text-white/40">
                  {g.group.replace("Group ", "G")}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-white font-medium">{g.group}</span>
                  <span className="text-[11px] text-white/40 tabular-nums">{formatNumber(g.totalSats)} sats</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-white/20">{dateRange}</span>
                  <span className="text-[10px] text-white/10">·</span>
                  <span className="text-[10px] text-white/20">{g.launches.length} mission{g.launches.length !== 1 ? "s" : ""}</span>
                  {g.successRate === 100 ? (
                    <CheckCircle2 className="w-2.5 h-2.5 text-spacex-success/50" />
                  ) : g.successRate > 0 ? (
                    <Clock className="w-2.5 h-2.5 text-spacex-warning/50" />
                  ) : (
                    <XCircle className="w-2.5 h-2.5 text-spacex-danger/50" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-between text-[10px] text-white/20">
        <span>{groups.length} groups</span>
        <span>{formatNumber(groups.reduce((s, g) => s + g.totalSats, 0))} total deployed</span>
      </div>
    </div>
  );
}

function formatCompactDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
