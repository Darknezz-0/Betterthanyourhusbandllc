import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

type PhotoPair = {
  before: string;
  after: string;
};

// Add future approved project photos as another pair here. Images live in public/assets/projects.
const photoPairs: PhotoPair[] = [
  { before: 'kitchen-before.webp', after: 'kitchen-after.webp' },
  { before: 'cabinets-before.webp', after: 'cabinets-after.webp' },
  { before: 'garden-before.webp', after: 'garden-after.webp' },
  { before: 'yard-before.webp', after: 'yard-after.webp' },
];

const asset = (filename: string) => `${import.meta.env.BASE_URL}assets/projects/${filename}`;

function ComparisonSlider({ before, after }: PhotoPair) {
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  function moveToPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition(Math.round(Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveToPointer(event);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current) moveToPointer(event);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setPosition((value) => Math.max(0, value - 5));
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setPosition((value) => Math.min(100, value + 5));
    else if (event.key === 'Home') setPosition(0);
    else if (event.key === 'End') setPosition(100);
    else return;
    event.preventDefault();
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Before and after photo comparison. Use the arrow keys or drag to compare."
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={position}
      aria-valuetext={`${position}% before, ${100 - position}% after`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      style={{ touchAction: 'pan-y' }}
      className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden bg-[#101214] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:aspect-[3/2]"
      data-testid="before-after-slider"
    >
      <img src={asset(after)} alt="After project photo" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={asset(before)} alt="Before project photo" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <span className="pointer-events-none absolute left-4 top-4 z-10 bg-[#141618]/90 px-3 py-2 font-mono-brand text-[10px] uppercase tracking-[.16em] text-[#eeeae0] sm:left-6 sm:top-6">Before</span>
      <span className="pointer-events-none absolute right-4 top-4 z-10 bg-[#141618]/90 px-3 py-2 font-mono-brand text-[10px] uppercase tracking-[.16em] text-[#eeeae0] sm:right-6 sm:top-6">After</span>
      <span className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-[#eeeae0] shadow-lg" style={{ left: `${position}%` }} aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#eeeae0] bg-[#141618] text-sm text-[#eeeae0] shadow-xl">‹ ›</span>
      </span>
    </div>
  );
}

export function BeforeAfterProjects() {
  return (
    <section aria-labelledby="before-after-heading" className="border-t border-[#b39860]/20 bg-[#151719] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" data-testid="before-after-projects">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-primary">Project photos</p>
        <h2 id="before-after-heading" className="mt-5 font-display text-4xl leading-tight sm:text-5xl">Before &amp; After</h2>
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">Drag the divider to compare, or use the arrow keys when the image is selected.</p>

        <div className="mt-10 max-w-4xl border border-border bg-card p-3 sm:p-5">
          <ComparisonSlider before="patio-before.webp" after="patio-after.webp" />
          <p className="px-1 pt-4 font-mono-brand text-[10px] uppercase tracking-[.16em] text-primary">Drag to compare · Before / After</p>
        </div>

        <div className="mt-12 space-y-6">
          {photoPairs.map((pair, index) => (
            <figure key={pair.before} className="border border-border bg-card p-4 sm:p-6" data-testid={`project-pair-${index + 1}`}>
              <figcaption className="mb-5 font-mono-brand text-[10px] uppercase tracking-[.16em] text-primary">Before &amp; After · {String(index + 1).padStart(2, '0')}</figcaption>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <p className="mb-3 font-mono-brand text-[10px] uppercase tracking-[.16em] text-muted-foreground">Before</p>
                  <img src={asset(pair.before)} alt={`Before photo ${index + 1}`} loading="lazy" className="h-auto w-full border border-border" />
                </div>
                <div>
                  <p className="mb-3 font-mono-brand text-[10px] uppercase tracking-[.16em] text-muted-foreground">After</p>
                  <img src={asset(pair.after)} alt={`After photo ${index + 1}`} loading="lazy" className="h-auto w-full border border-border" />
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}