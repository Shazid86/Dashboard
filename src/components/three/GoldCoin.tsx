import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  radius?: number;
  thickness?: number;
  rotationSpeed?: number;
  position?: [number, number, number];
  emissiveIntensity?: number;
}

export default function GoldCoin({
  radius = 1,
  thickness = 0.14,
  rotationSpeed = 0.8,
  position = [0, 0, 0],
  emissiveIntensity = 0.35,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  const goldProps = (color = "#e3ac37", roughness = 0.06) => ({
    metalness: 1.0,
    roughness,
    color,
    emissive: "#b17e1f" as const,
    emissiveIntensity,
    envMapIntensity: 2.5,
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <cylinderGeometry args={[radius, radius, thickness, 96]} />
        <meshStandardMaterial {...goldProps()} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, thickness * 0.52, 24, 96]} />
        <meshStandardMaterial {...goldProps("#c49020", 0.12)} />
      </mesh>

      <mesh position={[0, thickness / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.72, radius * 0.92, 80]} />
        <meshStandardMaterial
          {...goldProps("#f5dd8f", 0.06)}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, thickness / 2 + 0.003, 0]}>
        <cylinderGeometry args={[radius * 0.64, radius * 0.64, 0.012, 64]} />
        <meshStandardMaterial {...goldProps("#d4a02a", 0.18)} />
      </mesh>

      <mesh position={[0, thickness / 2 + 0.018, 0]}>
        <octahedronGeometry args={[radius * 0.24, 0]} />
        <meshStandardMaterial
          metalness={0.8}
          roughness={0.0}
          color="#fdf8ec"
          emissive="#e3ac37"
          emissiveIntensity={emissiveIntensity * 3.5}
          envMapIntensity={3}
        />
      </mesh>

      <mesh position={[0, -(thickness / 2 + 0.001), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.72, radius * 0.92, 80]} />
        <meshStandardMaterial
          {...goldProps("#f5dd8f", 0.06)}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}