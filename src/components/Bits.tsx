import { useState } from "react";
import { TYPE_COLORS, spriteUrl, type Mon } from "../game/data";
import { BRAND, DEFAULT_LOGO, useLogo } from "../game/brand";

export function MonSprite({
  mon,
  shiny = false,
  size = 48,
  className = "",
  pixel = true,
  style,
}: {
  mon: Mon;
  shiny?: boolean;
  size?: number;
  className?: string;
  pixel?: boolean;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const color = TYPE_COLORS[mon.types[0]] ?? "#A8A77A";

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full font-black text-white ${className}`}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 30%, #ffffff88, ${color})`,
          boxShadow: `inset 0 0 0 ${Math.max(2, size * 0.06)}px rgba(255,255,255,.55)`,
          fontSize: size * 0.42,
          textShadow: "0 1px 2px rgba(0,0,0,.6)",
          ...style,
        }}
        title={mon.name}
      >
        {mon.name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={spriteUrl(mon.id, shiny)}
      alt={mon.name}
      width={size}
      height={size}
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: pixel ? "pixelated" : "auto",
        filter: `drop-shadow(0 2px 3px rgba(0,0,0,.45))`,
        ...style,
      }}
    />
  );
}

/** Pokémon-logo-styled wordmark drawn as SVG so the outline stays crisp. */
export function PokeLogo({
  width = 320,
  stacked = false,
  className = "",
}: {
  width?: number;
  stacked?: boolean;
  className?: string;
}) {
  if (stacked) {
    return (
      <svg viewBox="0 0 220 118" className={className} style={{ width }} aria-label={BRAND.name}>
        <defs>
          <linearGradient id="pl-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff1a8" />
            <stop offset="50%" stopColor="#ffcb05" />
            <stop offset="100%" stopColor="#e89400" />
          </linearGradient>
        </defs>
        <g fontFamily="Titan One, Nunito, sans-serif" textAnchor="middle">
          <g fill="#1b2470" stroke="none">
            <text x="112" y="59" fontSize="40">DAN GOLD</text>
            <text x="112" y="102" fontSize="40">HANDS</text>
          </g>
          <g
            fill="url(#pl-g)"
            stroke="#2a3b9c"
            strokeWidth="7"
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            <text x="110" y="55" fontSize="40">DAN GOLD</text>
            <text x="110" y="98" fontSize="40">HANDS</text>
          </g>
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 470 78" className={className} style={{ width }} aria-label={BRAND.name}>
      <defs>
        <linearGradient id="pl-g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff1a8" />
          <stop offset="50%" stopColor="#ffcb05" />
          <stop offset="100%" stopColor="#e89400" />
        </linearGradient>
      </defs>
      <g fontFamily="Titan One, Nunito, sans-serif" textAnchor="middle">
        <text x="237" y="58" fontSize="47" fill="#1b2470">
          {BRAND.nameUpper}
        </text>
        <text
          x="235"
          y="54"
          fontSize="47"
          fill="url(#pl-g2)"
          stroke="#2a3b9c"
          strokeWidth="7"
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {BRAND.nameUpper}
        </text>
      </g>
    </svg>
  );
}

/**
 * Hebrew brand lettering curved around the top of the wheel hub — used only
 * while the placeholder logo is showing, so the real uploaded picture (which
 * already contains its own Hebrew lettering) is never over-printed.
 */
export function BrandCrown({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    >
      <defs>
        <path id="dgh-arc" d="M 20 52 A 30 30 0 0 1 80 52" fill="none" />
        <linearGradient id="dgh-heb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dff4ff" />
          <stop offset="55%" stopColor="#7fd2ff" />
          <stop offset="100%" stopColor="#2f8fe0" />
        </linearGradient>
      </defs>
      <text
        fontFamily="'Noto Sans Hebrew', Arial, sans-serif"
        fontWeight={900}
        fontSize="15"
        fill="url(#dgh-heb)"
        stroke="#10337d"
        strokeWidth="2.6"
        strokeLinejoin="round"
        paintOrder="stroke"
        textAnchor="middle"
      >
        <textPath href="#dgh-arc" startOffset="50%">
          דן ידי זהב
        </textPath>
      </text>
      <text
        x="50"
        y="33"
        textAnchor="middle"
        fontFamily="'Noto Sans Hebrew', Arial, sans-serif"
        fontWeight={700}
        fontSize="5.4"
        fill="#ffffff"
        stroke="#0d1c46"
        strokeWidth="1.2"
        paintOrder="stroke"
        opacity="0.95"
      >
        לייבים | פתיחות | מכירות
      </text>
    </svg>
  );
}

/** Blurred page backdrop made from the same uploaded picture (round part stays in the hub). */
export function BrandBackdrop() {
  const src = useLogo();
  if (src === DEFAULT_LOGO) return null;
  return (
    <div
      className="brand-backdrop"
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden
    />
  );
}

/** The channel logo, always shown as a circle (used in the wheel hub + header). */
export function LogoBadge({
  size,
  ring = true,
  zoom = 1,
  className = "",
  style,
}: {
  size: number | string;
  ring?: boolean;
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const src = useLogo();
  const px = typeof size === "number" ? size : undefined;
  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: ring
          ? `0 0 0 ${px ? Math.max(2, px * 0.03) : 3}px #ffcb05, 0 0 ${
              px ? px * 0.12 : 12
            }px rgba(255,203,5,.55)`
          : undefined,
        background: "#0b1020",
        ...style,
      }}
    >
      <img
        src={src}
        alt={`${BRAND.name} logo`}
        draggable={false}
        className="h-full w-full select-none object-cover"
        style={{ transform: `scale(${zoom})` }}
      />
    </div>
  );
}

export function PokeballIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <circle cx="24" cy="24" r="21" fill="#fff" stroke="#151515" strokeWidth="4" />
      <path d="M3 24a21 21 0 0 1 42 0z" fill="#ee1c25" stroke="#151515" strokeWidth="4" />
      <line x1="3" y1="24" x2="45" y2="24" stroke="#151515" strokeWidth="4" />
      <circle cx="24" cy="24" r="7" fill="#fff" stroke="#151515" strokeWidth="4" />
    </svg>
  );
}
