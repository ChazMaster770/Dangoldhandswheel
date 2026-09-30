import { useMemo } from "react";
import { matches, objectiveLabel, type Objective, type Segment } from "../game/data";
import { BrandCrown, LogoBadge, MonSprite } from "./Bits";
import { DEFAULT_LOGO, useLogo } from "../game/brand";

const GOLD = "#ffd93b";

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt * 255));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt * 255));
  const b = Math.max(0, Math.min(255, (n & 255) + amt * 255));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function Wheel({
  segments,
  size,
  spinRef,
  labelRef,
  objective,
  landed,
  showTargets,
}: {
  segments: Segment[];
  size: number;
  spinRef: React.RefObject<HTMLDivElement | null>;
  labelRef: React.RefObject<HTMLDivElement | null>;
  objective: Objective;
  landed: number | null;
  showTargets: boolean;
}) {
  const count = segments.length;
  const A = 360 / count;
  const R = size / 2;
  // 0 = classic (few names), 1 = crowded but labels fit, 2 = packed, sprites only
  const tier = count > 60 ? 2 : count > 14 ? 1 : 0;
  const dense = tier > 0;
  const logoSrc = useLogo();

  const arcAt = (r: number) => (Math.PI * 2 * r) / count;
  const spriteSize =
    tier === 2
      ? Math.max(9, Math.min(24, arcAt(R * 0.9) * 1.3))
      : tier === 1
        ? Math.max(14, Math.min(26, arcAt(R * 0.9) * 0.95))
        : Math.max(20, Math.min(size * 0.125, arcAt(R * 0.76) * 0.64));
  const nameSize =
    tier === 1
      ? Math.max(8, Math.min(13, arcAt(R * 0.62) * 0.62))
      : Math.max(9, Math.min(size * 0.034, 16));
  const rOuter = dense ? R * 0.93 : R * 0.95;
  const rInner = tier === 2 ? R * 0.5 : dense ? R * 0.34 : R * 0.35;
  const showPegs = count <= 40;
  const hiR = tier === 2 ? R * 0.55 : tier === 1 ? R * 0.33 : R * 0.58;
  const nameVisible = tier < 2;

  const gradient = useMemo(
    () =>
      `conic-gradient(from 0deg, ${segments
        .map((s, i) => `${i % 2 ? shade(s.color, -0.16) : s.color} ${i * A}deg ${(i + 1) * A}deg`)
        .join(", ")})`,
    [segments, A],
  );

  const pt = (ang: number, r: number) => {
    const a = (ang * Math.PI) / 180;
    return [Math.sin(a) * r, -Math.cos(a) * r];
  };

  const wedge = (i: number, r0: number, r1: number) => {
    const a0 = i * A;
    const a1 = i * A + A;
    const [x0, y0] = pt(a0, r1);
    const [x1, y1] = pt(a1, r1);
    const [x2, y2] = pt(a1, r0);
    const [x3, y3] = pt(a0, r0);
    return `M${x0} ${y0} A${r1} ${r1} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 0 ${x3} ${y3} Z`;
  };

  const obj = objectiveLabel(objective);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      data-wheel
    >
      {/* glow behind wheel */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,214,59,.42) 0%, rgba(58,80,220,.22) 55%, transparent 72%)",
        }}
      />

      {/* rotating assembly */}
      <div
        ref={spinRef}
        className="absolute inset-0 rounded-full will-change-transform"
        style={{ transform: "rotate(0deg)" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: gradient }}
        />
        {/* radial sheen + edge shading */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(255,255,255,.20) 0%, rgba(255,255,255,0) 46%, rgba(0,0,0,.30) 100%)",
          }}
        />

        <svg
          viewBox={`${-R} ${-R} ${size} ${size}`}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          {/* separators */}
          {segments.map((_, i) => {
            const [x, y] = pt(i * A, tier === 2 ? R * 0.4 : dense ? R * 0.28 : R * 0.29);
            const [x2, y2] = pt(i * A, R * 0.995);
            return (
              <line
                key={`d${i}`}
                x1={x}
                y1={y}
                x2={x2}
                y2={y2}
                stroke={dense ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.72)"}
                strokeWidth={dense ? Math.max(1, size * 0.0022) : Math.max(1.2, size * 0.005)}
              />
            );
          })}
          {/* rim pegs */}
          {showPegs &&
            segments.map((_, i) => {
              const [x, y] = pt(i * A, R * 0.925);
              return (
                <circle
                  key={`p${i}`}
                  cx={x}
                  cy={y}
                  r={Math.max(2.5, size * 0.011)}
                  fill="#fff"
                  stroke="rgba(20,24,60,.65)"
                  strokeWidth={Math.max(1, size * 0.004)}
                />
              );
            })}
          {/* target highlight */}
          {showTargets &&
            segments.map((s, i) =>
              matches(s, objective) ? (
                <g key={`t${i}`}>
                  <path
                    d={wedge(i, hiR, R * 1.0)}
                    fill={GOLD}
                    className="seg-target"
                    style={{ mixBlendMode: "overlay" }}
                  />
                  <path
                    d={wedge(i, hiR, R * 1.0)}
                    fill="none"
                    stroke={GOLD}
                    strokeWidth={Math.max(2, size * 0.012)}
                    className="seg-target"
                  />
                </g>
              ) : null,
            )}
          {/* landed highlight */}
          {landed !== null && (
            <>
              <path
                d={wedge(landed, tier === 2 ? R * 0.48 : R * 0.3, R * 1.0)}
                fill="rgba(255,255,255,.28)"
                stroke="#fff"
                strokeWidth={Math.max(2.5, size * 0.014)}
              />
              <circle
                cx={0}
                cy={0}
                r={R}
                fill="none"
                stroke={GOLD}
                strokeWidth={Math.max(3, size * 0.02)}
                opacity={0.9}
              />
            </>
          )}
        </svg>

        {/* labels & sprites */}
        <div ref={labelRef} className="absolute inset-0" style={{ willChange: "opacity" }}>
              {segments.map((s, i) => {
            const theta = (i + 0.5) * A;
            const isTarget = showTargets && matches(s, objective);
            return (
              <div
                key={s.rocket ? `rocket${i}` : `${s.mon.id}`}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 0,
                  height: 0,
                  transformOrigin: "0 0",
                  transform: `rotate(${theta}deg)`,
                }}
              >
                <div
                  className="flex items-center"
                  style={{
                    transformOrigin: "0 0",
                    transform: `rotate(-90deg) translateX(${rInner}px)`,
                    height: 0,
                    width: rOuter - rInner,
                    justifyContent: "flex-end",
                    gap: size * 0.012,
                  }}
                >
                  {nameVisible && (
                    <span
                      className="flex-1 truncate text-right font-black uppercase leading-none"
                      style={{
                        fontSize: nameSize,
                        letterSpacing: "-0.01em",
                        color: "#fff",
                        textShadow:
                          "0 1px 0 rgba(0,0,0,.55), 0 0 6px rgba(0,0,0,.45), 0 0 2px rgba(0,0,0,.6)",
                      }}
                    >
                      {s.trainer}
                    </span>
                  )}
                  {s.rocket ? (
                    <span
                      className="grid place-items-center rounded-full font-black"
                      style={{
                        width: spriteSize,
                        height: spriteSize,
                        background: "linear-gradient(160deg,#ff4d5a,#7a0f18)",
                        boxShadow: "0 2px 5px rgba(0,0,0,.5)",
                        fontSize: spriteSize * 0.62,
                        color: "#fff",
                      }}
                    >
                      R
                    </span>
                  ) : (
                    <MonSprite
                      mon={s.mon}
                      shiny={s.shiny}
                      size={spriteSize}
                      style={{
                        filter: isTarget
                          ? `drop-shadow(0 0 6px ${GOLD}) drop-shadow(0 2px 2px rgba(0,0,0,.5))`
                          : "drop-shadow(0 2px 3px rgba(0,0,0,.5))",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* static outer rim */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 0 ${Math.max(4, size * 0.028)}px #fff, 0 0 0 ${Math.max(
            7,
            size * 0.045,
          )}px #2a3b9c, 0 ${Math.max(8, size * 0.04)}px ${size * 0.12}px rgba(0,0,0,.55)`,
        }}
      />

      {/* pulsing "ready" ring */}
      {showTargets && (
        <div
          className="anim-ring-pulse pointer-events-none absolute rounded-full"
          style={{
            inset: -size * 0.015,
            border: `${Math.max(2, size * 0.012)}px solid rgba(255,214,59,.8)`,
          }}
        />
      )}

      {/* hub */}
      <div
        className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        style={{
          width: size * (tier === 2 ? 0.3 : 0.34),
          height: size * (tier === 2 ? 0.3 : 0.34),
          background:
            "radial-gradient(circle at 50% 32%, #4257d6 0%, #22308f 55%, #131a52 100%)",
          boxShadow: `0 0 0 ${Math.max(3, size * 0.018)}px #fff, 0 0 0 ${Math.max(
            6,
            size * 0.03,
          )}px #2a3b9c, 0 ${size * 0.02}px ${size * 0.06}px rgba(0,0,0,.5), inset 0 0 ${size * 0.06}px rgba(0,0,0,.45)`,
        }}
      >
        <LogoBadge size="100%" ring={false} zoom={1.12} className="absolute inset-0" />
        {logoSrc === DEFAULT_LOGO && <BrandCrown />}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full anim-shine"
          aria-hidden
        />
      </div>

      {/* pointer */}
      <div
        className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
        style={{ top: -size * 0.088, width: size * 0.135 }}
      >
        <svg viewBox="0 0 60 74" className="w-full drop-shadow-[0_4px_6px_rgba(0,0,0,.5)]">
          <path
            d="M30 70 L8 26 A26 26 0 1 1 52 26 Z"
            fill="#ffcb05"
            stroke="#2a3b9c"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <circle cx="30" cy="24" r="13" fill="#fff" stroke="#2a3b9c" strokeWidth="4" />
          <path d="M17 24a13 13 0 0 1 26 0z" fill="#ee1c25" stroke="#2a3b9c" strokeWidth="4" />
          <circle cx="30" cy="24" r="4.5" fill="#fff" stroke="#2a3b9c" strokeWidth="3" />
          <path d="M30 62 L18 34 h24 Z" fill="#ee1c25" stroke="#2a3b9c" strokeWidth="3.5" />
        </svg>
      </div>

      {/* objective badge floating on the rim (visual cue only) */}
      <div className="sr-only">{obj.sub}</div>
    </div>
  );
}
