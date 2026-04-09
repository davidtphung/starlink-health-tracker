import { ExternalLink, Database, Satellite, Globe, BarChart3 } from "lucide-react";

export default function About() {
  return (
    <div className="px-phi-4 sm:px-phi-5 lg:px-phi-6 py-phi-6 sm:py-phi-7 max-w-2xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.1]">
          About
        </h2>
        <p className="text-white/35 mt-3 text-base">
          How this project works and where the data comes from.
        </p>
      </div>

      {/* Overview */}
      <div className="card rounded-xl p-6 mb-5">
        <h3 className="text-lg font-semibold text-white mb-3">Starlink Health Tracker</h3>
        <p className="text-white/50 text-[15px] leading-relaxed">
          A real-time monitoring dashboard for SpaceX's Starlink satellite constellation.
          This tracker aggregates public data from multiple sources to provide orbital health
          assessments, mission history, booster tracking, and 3D constellation
          visualization.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {[
          {
            icon: Globe,
            title: "3D Globe",
            desc: "Interactive globe showing real-time satellite positions color-coded by health.",
          },
          {
            icon: BarChart3,
            title: "Health Monitoring",
            desc: "Scoring based on BSTAR drag, orbital eccentricity, and altitude analysis.",
          },
          {
            icon: Satellite,
            title: "Live Tracking",
            desc: "Real-time orbital data for every Starlink satellite from SpaceX API and CelesTrak.",
          },
          {
            icon: Database,
            title: "Mission Database",
            desc: "Complete launch history with booster serials, flight counts, and landing records.",
          },
        ].map((feature) => (
          <div key={feature.title} className="card rounded-xl p-5">
            <feature.icon className="w-5 h-5 text-white/20 mb-3" aria-hidden="true" />
            <h4 className="font-semibold text-white text-sm mb-1.5">{feature.title}</h4>
            <p className="text-[13px] text-white/35 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Data Sources */}
      <div className="card rounded-xl p-6 mb-5">
        <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">SpaceX REST API</p>
              <p className="text-white/35 text-[13px]">
                Satellite catalog, launch history, core/booster data, launchpad information
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">CelesTrak / Space-Track</p>
              <p className="text-white/35 text-[13px]">
                TLE orbital elements, BSTAR drag coefficients, GP data for health analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Built By</h3>
        <a
          href="https://x.com/davidtphung"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 font-medium hover:text-white transition-colors text-[15px]"
        >
          David T Phung
        </a>
      </div>
    </div>
  );
}
