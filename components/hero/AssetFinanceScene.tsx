'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Group } from 'three';

function Truck() {
  return (
    <group position={[0, -0.15, 0]}>
      <mesh position={[0.35, 0.35, 0]} castShadow>
        <boxGeometry args={[2.4, 0.9, 1.05]} />
        <meshStandardMaterial color="#dbe7ff" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[-1.15, 0.42, 0]}>
        <boxGeometry args={[0.85, 0.72, 1]} />
        <meshStandardMaterial color="#8eb6ff" metalness={0.4} roughness={0.25} emissive="#1d4ed8" emissiveIntensity={0.15} />
      </mesh>
      {[-0.7, 0.55].map((x) =>
        [-0.48, 0.48].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.22, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 20]} />
            <meshStandardMaterial color="#0b1224" metalness={0.6} roughness={0.35} />
          </mesh>
        ))
      )}
    </group>
  );
}

export function AssetFinanceScene({ reduced }: { reduced?: boolean }) {
  const rig = useRef<Group>(null);
  useFrame((state) => {
    if (!rig.current || reduced) return;
    rig.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.28 + state.pointer.x * 0.15;
    rig.current.rotation.x = state.pointer.y * 0.06;
  });

  return (
    <group ref={rig}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} color="#dbeafe" />
      <pointLight position={[-3, 2, 2]} intensity={8} color="#22d3ee" />
      <pointLight position={[3, 1, -2]} intensity={6} color="#8b5cf6" />
      <Float speed={reduced ? 0 : 1.2} rotationIntensity={0.15} floatIntensity={0.35}>
        <Truck />
      </Float>
      {!reduced &&
        Array.from({ length: 18 }).map((_, index) => {
          const angle = (index / 18) * Math.PI * 2;
          const radius = 2.4 + (index % 3) * 0.35;
          return (
            <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(index) * 0.35, Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color={index % 2 ? '#22d3ee' : '#8b5cf6'} emissive={index % 2 ? '#22d3ee' : '#8b5cf6'} emissiveIntensity={0.8} />
            </mesh>
          );
        })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <ringGeometry args={[1.6, 1.64, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
