'use client';

export function HeroVideoBackground({ src = '/hero/assetfi-hero.mp4' }: { src?: string }) {
  return (
    <div className="absolute inset-0">
      <video className="h-full w-full object-cover" autoPlay muted loop playsInline poster="/hero/poster.svg">
        <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#040711]/70" />
    </div>
  );
}
