'use client';

import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

const AssetFinanceScene = dynamic(
  () => import('@/components/hero/AssetFinanceScene').then((mod) => mod.AssetFinanceScene),
  { ssr: false }
);

export function Hero3D({ reduced }: { reduced: boolean }) {
  return (
    <Canvas camera={{ position: [0, 1.1, 5.2], fov: 42 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <AssetFinanceScene reduced={reduced} />
      </Suspense>
    </Canvas>
  );
}
