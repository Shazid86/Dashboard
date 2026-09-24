import { useCallback, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import ParticleField from "./ParticleField";
import AmbientRings from "./AmbientRings";
import FloatingOrb from "./FloatingOrb";

function CameraRig({
  mouseX,
  mouseY,
}: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.x += (mouseX.current * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY.current * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function BackgroundGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      matRef.current.opacity = 0.018 + Math.sin(t * 0.4) * 0.006;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -12]} rotation={[-Math.PI / 2 + 0.4, 0, 0]}>
      <planeGeometry args={[60, 60, 28, 28]} />
      <meshBasicMaterial
        ref={matRef}
        color="#e3ac37"
        wireframe
        transparent
        opacity={0.02}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Scene({
  mouseX,
  mouseY,
}: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
}) {
  return (
    <>
      <CameraRig mouseX={mouseX} mouseY={mouseY} />

      <FloatingOrb
        position={[7, 5, -9]}
        radius={4.2}
        color="#d4a02a"
        opacity={0.14}
        pulseSpeed={3.2}
        pulseAmplitude={0.05}
        phaseOffset={0}
      />

      <FloatingOrb
        position={[-4, -5, -10]}
        radius={3.2}
        color="#8a601b"
        opacity={0.1}
        pulseSpeed={4.5}
        pulseAmplitude={0.03}
        phaseOffset={Math.PI}
      />

      <FloatingOrb
        position={[2, 1, -14]}
        radius={6}
        color="#b17e1f"
        opacity={0.055}
        pulseSpeed={6}
        pulseAmplitude={0.025}
        phaseOffset={1.2}
      />

      <AmbientRings />
      <BackgroundGrid />
      <ParticleField count={300} mouseX={mouseX} mouseY={mouseY} />
    </>
  );
}

export default function ThreeBackground() {
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) return;
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove, prefersReduced]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 100 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        }}
        style={{ background: "transparent" }}
        frameloop={prefersReduced ? "never" : "always"}
      >
        {!prefersReduced && <Scene mouseX={mouseX} mouseY={mouseY} />}
      </Canvas>
    </div>
  );
}