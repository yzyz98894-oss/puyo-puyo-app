'use client';

import dynamic from 'next/dynamic';

const PuyoGame = dynamic(
  () => import('./PuyoGame').then(m => m.PuyoGame),
  { ssr: false }
);

export function PuyoGameLoader() {
  return <PuyoGame />;
}
