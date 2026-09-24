import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT_COLORS = {
  gold: { primary: "#e3ac37", secondary: "#f5dd8f", emissive: "#b17e1f" },
  emerald: { primary: "#34d399", secondary: "#6ee7b7", emissive: "#059669" },
  rose: { primary: "#fb7185", secondary: "#fda4af", emissive: "#e11d48" },
  sky: { primary: "#38bdf8", secondary: "#7dd3fc", emissive: "#0284c7" },
} as const;

type Accent = keyof typeof ACCENT_COLORS;

function RotatingGem({
  accent,
  hovered,
}: {
  accent: Accent;
  hovered: React.MutableRefObject<boolean>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colors = ACCENT_COLORS[accent];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const speed = hovered.current ? 2.5 : 0.8;
    meshRef.current.rotation.y = t * speed * 0.6;
    meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.3;
    const targetScale = hovered.current ? 1.18 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.72, 0]} />
      <meshStandardMaterial
        color={colors.primary}
        emissive={colors.emissive}
        emissiveIntensity={hovered.current ? 0.8 : 0.4}
        metalness={0.7}
        roughness={0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function GemScene({ accent, hovered }: { accent: Accent; hovered: React.MutableRefObject<boolean> }) {
  const colors = ACCENT_COLORS[accent];
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 2]} intensity={1.2} color={colors.secondary} />
      <pointLight position={[-2, -1, 1]} intensity={0.6} color={colors.primary} />
      <Suspense fallback={null}>
        <RotatingGem accent={accent} hovered={hovered} />
      </Suspense>
    </>
  );
}

interface Props {
  accent?: Accent;
  className?: string;
}

export default function StatIcon3D({ accent = "gold", className }: Props) {
  const hovered = useRef(false);

  return (
    <div
      className={className}
      style={{ width: 40, height: 40 }}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <GemScene accent={accent} hovered={hovered} />
      </Canvas>
    </div>
  );
}