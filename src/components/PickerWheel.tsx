import { useMemo } from "react";
import { spriteUrl, type Mon } from "../game/data";
import type { Entry } from "../game/names";
import { BrandCrown, LogoBadge } from "./Bits";
import { DEFAULT_LOGO, useLogo } from "../game/brand";

const GOLD = "#ffd93b";

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt * 255));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt * 255));
  const b = Math.max(0, Math.min(255, (n & 255) + amt * 255));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function PickerWheel({
  entries,
  size,
  spinRef,
  labelRef,
  landed,
  spinning,
  showPokemon,
}: {
  entries: Entry[];
  size: number;
  spinRef: React.RefObject<HTMLDivElement | null>;
  labelRef: React.RefObject<HTMLDivElement | null>;
  landed: number | null;
  spinning: boolean;
  showPokemon: boolean;
}) {
  const n = entries.length;
  const count = Math.max(1, n);
  const A = 360 / count;
  const R = size / 2;
  const tier = n > 60 ? 2 : n > 14 ? 1 : 0;
  const empty = n === 0;
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
  const rOuter = tier > 0 ? R * 0.93 : R * 0.95;
  // the round logo is the star — labels start just outside it
  const hubSize = size * (tier === 2 ? 0.42 : 0.44);
  const rInner = tier === 2 ? R * 0.56 : R * 0.5;
  const showPegs = count <= 40;
  // hundreds of <img> tags would tank the frame rate — fall back to plain
  // coloured wedges with initials once a list gets truly huge
  const useSprites = showPokemon && n <= 150;
  // Past a few hundred names the badges would be sub-pixel anyway — keep the
  // wedges, divider lines and pointer, and drop the per-name overlay so big
  // lists (1,000+) still spin at 60fps.
  const showBadges = count <= 400;
  const showDividers = count <= 600;

  const gradient = useMemo(
    () =>
      n === 0
        ? "conic-gradient(from 0deg, #1b2a6b 0deg 180deg, #22308f 180deg 360deg)"
        : `conic-gradient(from 0deg, ${entries
            .map(
              (e, i) =>
                `${i % 2 ? shade(e.color, -0.17) : e.color} ${i * A}deg ${(i + 1) * A}deg`,
            )
            .join(", ")})`,
    [entries, A, n],
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

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} data-wheel>
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
        <div className="absolute inset-0 rounded-full" style={{ background: gradient }} />
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
          {empty && (
            <>
              <circle
                cx={0}
                cy={0}
                r={R * 0.8}
                fill="none"
                stroke="rgba(255,255,255,.25)"
                strokeWidth={Math.max(2, size * 0.008)}
                strokeDasharray="10 12"
              />
              <text
                x={0}
                y={-R * 0.06}
                textAnchor="middle"
                fill="rgba(255,255,255,.75)"
                fontFamily="Titan One, Nunito, sans-serif"
                fontSize={Math.max(14, size * 0.062)}
              >
                ADD NAMES
              </text>
              <text
                x={0}
                y={R * 0.12}
                textAnchor="middle"
                fill="rgba(255,255,255,.45)"
                fontFamily="Nunito, sans-serif"
                fontWeight="900"
                fontSize={Math.max(9, size * 0.036)}
              >
                to start the draw
              </text>
            </>
          )}
          {showDividers && entries.map((_, i) => {
            const [x, y] = pt(i * A, tier === 2 ? R * 0.4 : tier === 1 ? R * 0.28 : R * 0.29);
            const [x2, y2] = pt(i * A, R * 0.995);
            return (
              <line
                key={`d${i}`}
                x1={x}
                y1={y}
                x2={x2}
                y2={y2}
                stroke={tier > 0 ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.72)"}
                strokeWidth={
                  tier > 0 ? Math.max(1, size * 0.0022) : Math.max(1.2, size * 0.005)
                }
              />
            );
          })}

          {showPegs &&
            entries.map((_, i) => {
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

          {/* winner highlight */}
          {landed !== null && (
            <>
              <path
                d={wedge(landed, tier === 2 ? R * 0.48 : R * 0.3, R * 1.0)}
                fill="rgba(255,255,255,.3)"
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

        {/* labels */}
        <div
          ref={labelRef}
          className="absolute inset-0"
          style={{ willChange: "opacity", display: showBadges ? undefined : "none" }}
        >
          {entries.map((e, i) => {
            const theta = (i + 0.5) * A;
            return (
              <div
                key={e.id}
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
                  {tier < 2 && (
                    <span
                      className="min-w-0 flex-1 truncate text-right font-black uppercase leading-none"
                      style={{
                        fontSize: nameSize,
                        letterSpacing: "-0.01em",
                        color: "#fff",
                        textShadow:
                          "0 1px 0 rgba(0,0,0,.55), 0 0 6px rgba(0,0,0,.45), 0 0 2px rgba(0,0,0,.6)",
                      }}
                    >
                      {e.name}
                    </span>
                  )}
                  {e.weight > 1 && tier < 2 && (
                    <span
                      className="shrink-0 rounded-full font-black leading-none"
                      style={{
                        fontSize: Math.max(8, nameSize * 0.72),
                        padding: "2px 4px",
                        background: "rgba(255,214,59,.92)",
                        color: "#3b2600",
                        boxShadow: "0 1px 2px rgba(0,0,0,.4)",
                      }}
                    >
                      ×{e.weight}
                    </span>
                  )}
                  {useSprites ? (
                    <MonBadge mon={e.mon} size={spriteSize} />
                  ) : (
                    <span
                      className="grid shrink-0 place-items-center rounded-full font-black text-white"
                      style={{
                        width: spriteSize,
                        height: spriteSize,
                        background: `radial-gradient(circle at 35% 30%, #ffffff99, ${e.color2})`,
                        boxShadow: "inset 0 0 0 2px rgba(255,255,255,.5)",
                        fontSize: spriteSize * 0.4,
                        textShadow: "0 1px 2px rgba(0,0,0,.6)",
                      }}
                    >
                      {initials(e.name)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* static rim */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 0 ${Math.max(4, size * 0.028)}px #fff, 0 0 0 ${Math.max(
            7,
            size * 0.045,
          )}px #2a3b9c, 0 ${Math.max(8, size * 0.04)}px ${size * 0.12}px rgba(0,0,0,.55)`,
        }}
      />

      {/* ready pulse */}
      {!spinning && landed === null && (
        <div
          className="anim-ring-pulse pointer-events-none absolute rounded-full"
          style={{
            inset: -size * 0.015,
            border: `${Math.max(2, size * 0.012)}px solid rgba(255,214,59,.8)`,
          }}
        />
      )}

      {/* hub — the channel logo */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: hubSize,
          height: hubSize,
          boxShadow: `0 0 0 ${Math.max(3, size * 0.014)}px #ffcb05, 0 0 0 ${Math.max(
            5,
            size * 0.024,
          )}px #2a3b9c, 0 ${size * 0.02}px ${size * 0.07}px rgba(0,0,0,.55), 0 0 ${size * 0.08}px rgba(255,203,5,.35)`,
        }}
      >
        <LogoBadge size="100%" ring={false} zoom={1.12} />
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
    </div>
  );
}

function MonBadge({ mon, size }: { mon: Mon; size: number }) {
  return (
    <img
      src={spriteUrl(mon.id)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="shrink-0"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: "pixelated",
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,.5))",
      }}
    />
  );
}
