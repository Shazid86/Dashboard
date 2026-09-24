import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function AmbientRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const SPEED_1 = (Math.PI * 2) / 18;
  const SPEED_2 = (Math.PI * 2) / 34;

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += SPEED_1 * delta;
      ring1Ref.current.rotation.x += SPEED_1 * delta * 0.4;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= SPEED_2 * delta;
      ring2Ref.current.rotation.y -= SPEED_2 * delta * 0.3;
    }
  });

  return (
    <group>
      <mesh ref={ring1Ref} position={[6, -2, -8]} rotation={[0.6, 0, 0.3]}>
        <torusGeometry args={[4.5, 0.012, 32, 160]} />
        <meshBasicMaterial
          color="#e3ac37"
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring2Ref} position={[-5, 3, -6]} rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[2.8, 0.009, 32, 120]} />
        <meshBasicMaterial
          color="#f5dd8f"
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 4, -10]} rotation={[0.2, 1.2, 0]}>
        <torusGeometry args={[6.5, 0.006, 32, 200]} />
        <meshBasicMaterial
          color="#d4a02a"
          transparent
          opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}