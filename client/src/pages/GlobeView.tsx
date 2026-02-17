import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useState, useMemo, useRef } from "react";
import { useSatellites } from "../hooks/useSatellites";
import * as THREE from "three";
import { latLonToXYZ } from "../lib/utils";
import type { StarlinkSatellite } from "@shared/types";
import { Info, X, Activity, MapPin, Calendar, Shield } from "lucide-react";
import { formatDate, getHealthColor } from "../lib/utils";

const EARTH_RADIUS = 2;
const SAT_ALTITUDE = 0.15; // visual altitude above globe surface

// NASA Blue Marble textures (public domain)
const EARTH_TEXTURE_URL = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const EARTH_BUMP_URL = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [dayMap, bumpMap] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURE_URL,
    EARTH_BUMP_URL,
  ]);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={dayMap}
        bumpMap={bumpMap}
        bumpScale={0.03}
        roughness={0.7}
        metalness={0.1}
      />
      {/* Subtle wireframe overlay for techy grid look */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.003, 36, 18]} />
        <meshBasicMaterial
          color="#005288"
          wireframe
          transparent
          opacity={0.04}
        />
      </mesh>
    </mesh>
  );
}

// Fallback Earth in case textures fail to load
function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial
        color="#1a3a5c"
        roughness={0.8}
        metalness={0.2}
        emissive="#0a1929"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.04, 64, 64]} />
        <meshBasicMaterial
          color="#4a9eda"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.12, 64, 64]} />
        <meshBasicMaterial
          color="#1a6fb5"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}

interface SatelliteDotsProps {
  satellites: StarlinkSatellite[];
  onSelect: (sat: StarlinkSatellite) => void;
}

function SatelliteDots({ satellites, onSelect }: SatelliteDotsProps) {
  const activeSats = useMemo(
    () =>
      satellites.filter(
        (s) =>
          s.status === "active" &&
          s.latitude !== null &&
          s.longitude !== null
      ),
    [satellites]
  );

  // Sample for performance — show up to 3000 dots
  const sampled = useMemo(() => {
    if (activeSats.length <= 3000) return activeSats;
    const step = Math.ceil(activeSats.length / 3000);
    return activeSats.filter((_, i) => i % step === 0);
  }, [activeSats]);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(sampled.length * 3);
    const col = new Float32Array(sampled.length * 3);

    sampled.forEach((sat, i) => {
      const [x, y, z] = latLonToXYZ(
        sat.latitude!,
        sat.longitude!,
        EARTH_RADIUS + SAT_ALTITUDE
      );
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color by health
      let r = 0, g = 0.78, b = 0.33; // nominal = green
      if (sat.healthStatus === "degraded") {
        r = 1; g = 0.6; b = 0; // orange
      } else if (sat.healthStatus === "critical") {
        r = 0.96; g = 0.26; b = 0.21; // red
      }
      col[i * 3] = r;
      col[i * 3 + 1] = g;
      col[i * 3 + 2] = b;
    });

    return { positions: pos, colors: col };
  }, [sampled]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={sampled.length}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={sampled.length}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

// Orbit ring visualization
function OrbitRings() {
  const rings = useMemo(() => {
    const inclinations = [53, 70, 97.6]; // main orbital planes
    return inclinations.map((inc, i) => {
      const curve = new THREE.EllipseCurve(
        0, 0,
        EARTH_RADIUS + SAT_ALTITUDE,
        EARTH_RADIUS + SAT_ALTITUDE,
        0, 2 * Math.PI,
        false, 0
      );
      const points = curve.getPoints(128);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      return { geometry, inclination: inc, key: i };
    });
  }, []);

  return (
    <>
      {rings.map((ring) => (
        <lineLoop
          key={ring.key}
          geometry={ring.geometry}
          rotation={[
            (ring.inclination * Math.PI) / 180,
            (ring.key * Math.PI) / 3,
            0,
          ]}
        >
          <lineBasicMaterial
            color="#005288"
            transparent
            opacity={0.15}
          />
        </lineLoop>
      ))}
    </>
  );
}

function Scene({ satellites, onSelect }: SatelliteDotsProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <pointLight position={[-5, -3, -5]} intensity={0.2} color="#4a9eda" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <Suspense fallback={<EarthFallback />}>
        <Earth />
      </Suspense>
      <Atmosphere />
      <OrbitRings />
      <SatelliteDots satellites={satellites} onSelect={onSelect} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export default function GlobeView() {
  const { data: satellites, isLoading } = useSatellites();
  const [selected, setSelected] = useState<StarlinkSatellite | null>(null);

  const activeSatCount = satellites?.filter((s) => s.status === "active").length || 0;

  return (
    <div className="relative h-[calc(100vh-55px)]">
      {/* Globe */}
      <div className="absolute inset-0 globe-canvas">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-2 border-spacex-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-spacex-accent font-mono text-sm tracking-wider">
                LOADING CONSTELLATION...
              </p>
            </div>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "#000000" }}
          >
            <Suspense fallback={null}>
              <Scene
                satellites={satellites || []}
                onSelect={setSelected}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Overlay Stats */}
      <div className="absolute top-phi-4 left-phi-4 glass rounded-xl p-phi-4 max-w-xs" role="status" aria-live="polite">
        <div className="flex items-center gap-phi-2 mb-phi-2">
          <div className="w-2 h-2 rounded-full bg-spacex-success animate-pulse" />
          <span className="text-xs font-mono text-spacex-success tracking-wider">LIVE TRACKING</span>
        </div>
        <p className="text-2xl font-bold text-white font-mono">
          {activeSatCount.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">Active Satellites in Orbit</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-phi-4 left-phi-4 glass rounded-xl p-phi-3">
        <p className="text-xs font-mono text-gray-400 mb-phi-2">HEALTH STATUS</p>
        <div className="flex gap-phi-4 text-xs">
          <span className="flex items-center gap-phi-1">
            <span className="w-2 h-2 rounded-full bg-spacex-success" aria-hidden="true" />
            Nominal
          </span>
          <span className="flex items-center gap-phi-1">
            <span className="w-2 h-2 rounded-full bg-spacex-warning" aria-hidden="true" />
            Degraded
          </span>
          <span className="flex items-center gap-phi-1">
            <span className="w-2 h-2 rounded-full bg-spacex-danger" aria-hidden="true" />
            Critical
          </span>
        </div>
      </div>

      {/* Interaction hint */}
      <div className="absolute bottom-phi-4 right-phi-4 glass rounded-xl px-phi-3 py-phi-2">
        <p className="text-xs text-gray-500 font-mono">
          DRAG TO ROTATE / SCROLL TO ZOOM
        </p>
      </div>

      {/* Selected Satellite Panel */}
      {selected && (
        <div className="absolute top-phi-4 right-phi-4 glass rounded-xl p-phi-5 w-80 animate-fade-in" role="dialog" aria-label="Satellite details">
          <div className="flex items-center justify-between mb-phi-4">
            <h3 className="font-semibold text-spacex-accent">{selected.name}</h3>
            <button
              onClick={() => setSelected(null)}
              className="p-1 hover:bg-white/10 rounded"
              aria-label="Close satellite details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-phi-3 text-sm">
            <div className="flex items-center gap-phi-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Health:</span>
              <span className={getHealthColor(selected.healthStatus)}>
                {selected.healthStatus.toUpperCase()} ({selected.healthScore}%)
              </span>
            </div>
            <div className="flex items-center gap-phi-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Position:</span>
              <span>{selected.latitude?.toFixed(2)}, {selected.longitude?.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-phi-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Altitude:</span>
              <span>{selected.heightKm?.toFixed(1)} km</span>
            </div>
            <div className="flex items-center gap-phi-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Launched:</span>
              <span>{formatDate(selected.launchDate)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 font-mono">
              NORAD ID: {selected.noradId} | Version: {selected.version}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
