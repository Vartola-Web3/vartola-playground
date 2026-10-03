export function ExplainerVideo() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B]">
      <div className="aspect-video">
        <iframe
          className="h-full w-full"
          src="https://www.youtube-nocookie.com/embed/umv002vZQkw"
          title="How Vartola works"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  );
}
