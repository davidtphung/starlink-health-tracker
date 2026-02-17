import { Route, Switch, Link, useLocation } from "wouter";
import { Suspense, lazy } from "react";
import { Satellite, Rocket, BarChart3, Info, Menu, X } from "lucide-react";
import { useState } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const GlobeView = lazy(() => import("./pages/GlobeView"));
const Launches = lazy(() => import("./pages/Launches"));
const About = lazy(() => import("./pages/About"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-spacex-darker">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-spacex-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-spacex-accent font-mono text-sm tracking-wider">
          LOADING TELEMETRY...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/globe", label: "3D Globe", icon: Satellite },
    { path: "/launches", label: "Missions", icon: Rocket },
    { path: "/about", label: "About", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-spacex-darker text-gray-200">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/5" role="banner">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group" aria-label="Starlink Health Tracker Home">
                <div className="w-8 h-8 rounded-lg bg-spacex-blue/20 flex items-center justify-center group-hover:bg-spacex-blue/30 transition-colors">
                  <Satellite className="w-5 h-5 text-spacex-accent" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight gradient-text">
                    STARLINK TRACKER
                  </h1>
                  <p className="text-[10px] text-gray-500 font-mono tracking-widest -mt-1">
                    HEALTH MONITOR
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-spacex-blue/20 text-spacex-accent"
                          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {item.label}
                    </button>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-white/5 py-2 px-4" role="navigation" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-spacex-blue/20 text-spacex-accent"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" role="main" className="max-w-[1800px] mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/globe" component={GlobeView} />
            <Route path="/launches" component={Launches} />
            <Route path="/about" component={About} />
            <Route>
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                  <h2 className="text-4xl font-bold gradient-text mb-4">404</h2>
                  <p className="text-gray-400">Signal lost. Page not found.</p>
                  <Link href="/">
                    <button className="mt-6 px-6 py-2 bg-spacex-blue/20 text-spacex-accent rounded-lg hover:bg-spacex-blue/30 transition-colors">
                      Return to Dashboard
                    </button>
                  </Link>
                </div>
              </div>
            </Route>
          </Switch>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12" role="contentinfo">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>
              Built by{" "}
              <span className="text-spacex-accent">David T Phung</span> | Data from
              SpaceX API &amp; CelesTrak
            </p>
            <p className="font-mono tracking-wider">STARLINK HEALTH TRACKER v1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
