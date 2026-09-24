import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  radius?: number;
  color?: string;
  opacity?: number;
  pulseSpeed?: number;
  pulseAmplitude?: number;
  phaseOffset?: number;
}

export default function FloatingOrb({
  position,
  radius = 3.5,
  color = "#d4a02a",
  opacity = 0.12,
  pulseSpeed = 3.2,
  pulseAmplitude = 0.04,
  phaseOffset = 0,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / pulseSpeed + phaseOffset);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = opacity * (0.5 + pulse * 0.8);
    const scale = 1 + Math.sin((t * Math.PI * 2) / pulseSpeed + phaseOffset) * pulseAmplitude;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}