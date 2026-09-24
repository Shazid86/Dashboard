import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count?: number;
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
}

export default function ParticleField({ count = 320, mouseX, mouseY }: Props) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      speeds[i] = 0.015 + Math.random() * 0.025;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, offsets };
  }, [count]);

  const origPositions = useMemo(() => Float32Array.from(positions), [positions]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    const mx = mouseX.current * 0.6;
    const my = mouseY.current * 0.6;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const dy = speeds[i] * t;
      let y = origPositions[idx + 1] + dy;
      if (y > 9) y -= 18;

      pos[idx + 0] = origPositions[idx + 0] + mx;
      pos[idx + 1] = y;
      pos[idx + 2] = origPositions[idx + 2] + my;

      pos[idx + 0] += Math.sin(t * 0.3 + offsets[i]) * 0.08;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#e3ac37"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}