import { Link } from "wouter";
import { ArrowRight, Maximize2 } from "lucide-react";
import { formatNumber } from "../lib/utils";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Lightweight mini globe — no textures, just wireframe + dots
function MiniEarth() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });
  return (
    <group ref={meshRef}>
      {/* Solid dark sphere */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#0a1628" />
      </mesh>
      {/* Wireframe grid */}
      <mesh>
        <sphereGeometry args={[1.005, 24, 12]} />
        <meshBasicMaterial color="#005288" wireframe transparent opacity={0.15} />
      </mesh>
      {/* Glow ring */}
      <mesh>
        <sphereGeometry args={[1.04, 32, 32]} />
        <meshBasicMaterial color="#1a6fb5" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function SatellitePoints() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random orbital dots
  const { positions, colors } = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1.08 + Math.random() * 0.04;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      // Green dots
      col[i * 3] = 0;
      col[i * 3 + 1] = 0.78;
      col[i * 3 + 2] = 0.33;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(() => {
    if (pointsRef.current) pointsRef.current.rotation.y += 0.002;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={200} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={200} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function MiniScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 2, 3]} intensity={0.8} />
      <MiniEarth />
      <SatellitePoints />
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </>
  );
}

export default function GlobePreview({ activeCount }: { activeCount: number }) {
  return (
    <Link href="/globe">
      <div className="card rounded-xl cursor-pointer group h-full flex flex-col relative overflow-hidden">
        {/* Mini 3D canvas */}
        <div className="flex-1 min-h-[180px] relative">
          <Canvas
            camera={{ position: [0, 0, 2.8], fov: 40 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            <MiniScene />
          </Canvas>
          {/* Overlay gradient at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Expand icon */}
          <div className="absolute top-3 right-3 p-1.5 rounded-md bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3 h-3 text-white/50" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="p-5 pt-0 relative z-10 -mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="section-label">3D Globe</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
          </div>
          <p className="text-xl font-semibold text-white tabular-nums">{formatNumber(activeCount)}</p>
          <p className="text-[11px] text-white/25 mt-0.5">satellites · tap to explore</p>
        </div>
      </div>
    </Link>
  );
}
