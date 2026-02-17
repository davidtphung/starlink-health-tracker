import { Github, ExternalLink, Database, Satellite, Globe, BarChart3 } from "lucide-react";

export default function About() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">About</span>{" "}
          <span className="text-white">This Project</span>
        </h2>
      </div>

      {/* Overview */}
      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Starlink Health Tracker</h3>
        <p className="text-gray-300 leading-relaxed">
          A real-time monitoring dashboard for SpaceX's Starlink satellite constellation.
          This tracker aggregates public data from multiple sources to provide orbital health
          assessments, mission history, rocket and booster tracking, and 3D constellation
          visualization.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            icon: Globe,
            title: "3D Globe Visualization",
            desc: "Interactive Three.js globe showing real-time satellite positions color-coded by health status.",
          },
          {
            icon: BarChart3,
            title: "Health Monitoring",
            desc: "Satellite health scoring based on BSTAR drag, orbital eccentricity, and altitude analysis.",
          },
          {
            icon: Satellite,
            title: "Live Tracking",
            desc: "Real-time orbital data for every Starlink satellite from SpaceX API and CelesTrak.",
          },
          {
            icon: Database,
            title: "Mission Database",
            desc: "Complete launch history with Falcon 9 booster serials, flight counts, and landing records.",
          },
        ].map((feature) => (
          <div key={feature.title} className="glass rounded-xl p-5">
            <feature.icon className="w-6 h-6 text-spacex-accent mb-3" aria-hidden="true" />
            <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
            <p className="text-sm text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Data Sources */}
      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-spacex-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">SpaceX REST API (r/SpaceX)</p>
              <p className="text-gray-400">
                Satellite catalog, launch history, core/booster data, launchpad information
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-spacex-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">CelesTrak / Space-Track</p>
              <p className="text-gray-400">
                TLE orbital elements, BSTAR drag coefficients, GP data for health analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Accessibility</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          This site follows WCAG 2.1 AA guidelines. Features include keyboard navigation,
          screen reader support with ARIA labels, skip navigation links, sufficient color
          contrast ratios, and responsive design for all device sizes. Focus indicators are
          visible for all interactive elements.
        </p>
      </div>

      {/* Credits */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Built By</h3>
        <p className="text-gray-300">
          <span className="text-spacex-accent font-semibold">David T Phung</span>
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Built with React, Three.js, Express, TailwindCSS, and the SpaceX public API.
        </p>
      </div>
    </div>
  );
}
