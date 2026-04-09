import { Route, Switch, Link, useLocation } from "wouter";
import { Suspense, lazy } from "react";
import { Satellite, Rocket, BarChart3, Info, Menu, X, Radio } from "lucide-react";
import { useState } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const GlobeView = lazy(() => import("./pages/GlobeView"));
const Launches = lazy(() => import("./pages/Launches"));
const About = lazy(() => import("./pages/About"));
const Live = lazy(() => import("./pages/Live"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[1.5px] border-white/20 border-t-white/80 rounded-full animate-spin" />
        <p className="text-white/40 text-xs tracking-[0.2em] uppercase">
          Loading
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
    { path: "/globe", label: "Globe", icon: Satellite },
    { path: "/launches", label: "Missions", icon: Rocket },
    { path: "/live", label: "Live", icon: Radio },
    { path: "/about", label: "About", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-black text-white/90">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header — clean, minimal like Starlink */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl" role="banner">
        <div className="max-w-container mx-auto px-phi-4 sm:px-phi-5 lg:px-phi-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group" aria-label="Starlink Health Tracker Home">
                <div className="relative">
                  <Satellite className="w-[18px] h-[18px] text-white/80 group-hover:text-white transition-colors" aria-hidden="true" />
                </div>
                <span className="text-[13px] font-semibold tracking-[0.15em] uppercase text-white/90 group-hover:text-white transition-colors">
                  Starlink Health
                </span>
              </div>
            </Link>

            {/* Desktop Nav — minimal text links */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      className={`px-4 py-2 text-[13px] font-medium tracking-wide transition-colors rounded-lg ${
                        isActive
                          ? "text-white bg-white/[0.06]"
                          : "text-white/40 hover:text-white/70"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </button>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white/40 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-white/[0.06] py-2 px-phi-4" role="navigation" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-white/40 hover:text-white/70"
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
      <main id="main-content" role="main" className="max-w-container mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/globe" component={GlobeView} />
            <Route path="/launches" component={Launches} />
            <Route path="/live" component={Live} />
            <Route path="/about" component={About} />
            <Route>
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-white mb-3">404</h2>
                  <p className="text-white/40 text-sm">Page not found</p>
                  <Link href="/">
                    <button className="mt-8 px-6 py-2.5 text-sm font-medium text-white border border-white/10 rounded-lg hover:bg-white/[0.06] transition-colors">
                      Back to Dashboard
                    </button>
                  </Link>
                </div>
              </div>
            </Route>
          </Switch>
        </Suspense>
      </main>

      {/* Footer — minimal */}
      <footer className="border-t border-white/[0.06] mt-phi-7" role="contentinfo">
        <div className="max-w-container mx-auto px-phi-4 sm:px-phi-5 lg:px-phi-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <div className="flex items-center gap-1.5">
              <span>Built by</span>
              <a
                href="https://x.com/davidtphung"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white/70 transition-colors"
              >
                David T Phung
              </a>
              <span className="mx-1 text-white/10">|</span>
              <span>Data from SpaceX API & CelesTrak</span>
            </div>
            <span className="tracking-[0.15em] uppercase">v2.3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
