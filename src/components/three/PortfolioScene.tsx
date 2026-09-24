import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import GoldCoin from "./GoldCoin";
import type { Holding } from "../../types";

const COLOR_HEX: Record<string, string> = {
  gold: "#e3ac37",
  emerald: "#34d399",
  sky: "#38bdf8",
  violet: "#a78bfa",
  rose: "#fb7185",
  cyan: "#22d3ee",
};

function Rig() {
  useFrame(({ pointer, camera }) => {
    camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.045;
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.045;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function OrbitGems({ holdings }: { holdings: Holding[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.18;
  });

  const gems = holdings.slice(0, 8);

  return (
    <group ref={groupRef}>
      {gems.map((h, i) => {
        const angle = (Math.PI * 2 * i) / Math.max(gems.length, 1);
        const radius = 1.95 + (i % 3) * 0.45;
        const color = COLOR_HEX[h.color] ?? COLOR_HEX.gold;
        return (
          <mesh key={h.id} position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.55, Math.sin(i) * 0.35]}>
            <icosahedronGeometry args={[0.2 + (i % 3) * 0.05, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} metalness={0.6} roughness={0.25} />
          </mesh>
        );
      })}
    </group>
  );
}

function OrbitRings() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (a.current) a.current.rotation.z += delta * 0.1;
    if (b.current) b.current.rotation.z -= delta * 0.08;
  });
  return (
    <>
      <mesh ref={a} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[2.6, 0.008, 32, 140]} />
        <meshBasicMaterial color="#e3ac37" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={b} rotation={[-0.35, 0.4, 0]}>
        <torusGeometry args={[3.4, 0.006, 32, 160]} />
        <meshBasicMaterial color="#f5dd8f" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}

interface Props {
  holdings: Holding[];
}

export default function PortfolioScene({ holdings }: Props) {
  return (
    <div className="h-full w-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.4, 5.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        <pointLight position={[3, 3, 3]} intensity={1.3} color="#f5dd8f" />
        <pointLight position={[-3, -2, 2]} intensity={0.7} color="#d4a02a" />
        <Rig />
        <OrbitRings />
        {holdings.length > 0 && <OrbitGems holdings={holdings} />}
        <GoldCoin radius={1.05} thickness={0.16} rotationSpeed={0.45} position={[0, 0, 0]} emissiveIntensity={0.55} />
      </Canvas>
    </div>
  );
}