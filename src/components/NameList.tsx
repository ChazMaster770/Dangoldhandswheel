import { useEffect, useRef } from "react";
import { matches, type Objective, type Segment } from "../game/data";

export function NameList({
  segments,
  objective,
  landed,
  liveIdx,
  compact = false,
}: {
  segments: Segment[];
  objective: Objective;
  landed: number | null;
  liveIdx: number;
  compact?: boolean;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastScrolled = useRef<number | null>(null);

  useEffect(() => {
    if (landed === null || landed === lastScrolled.current) return;
    lastScrolled.current = landed;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-row="${landed}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [landed]);

  const rows = compact ? segments : segments;

  return (
    <div
      ref={listRef}
      className="no-scrollbar h-full overflow-y-auto overscroll-contain rounded-2xl border-2 border-white/15 bg-black/30 p-1.5"
    >
      <ol className="space-y-[3px]">
        {rows.map((s, i) => {
          const target = matches(s, objective);
          const isLanded = landed === i;
          const isLive = liveIdx === i && landed === null;
          return (
            <li
              key={s.key}
              data-row={i}
              className={`flex items-center gap-1.5 rounded-lg px-1.5 py-[3px] transition-colors duration-150 ${
                isLanded
                  ? "bg-white/90 shadow-[0_0_0_2px_rgba(255,214,59,.9)]"
                  : isLive
                    ? "bg-sky-400/30 ring-1 ring-sky-300/70"
                    : target
                      ? "bg-amber-400/20 ring-1 ring-amber-300/50"
                      : i % 2
                        ? "bg-white/[0.05]"
                        : "bg-white/[0.02]"
              }`}
            >
              <span
                className={`w-4 shrink-0 text-center text-[9px] font-black tabular-nums ${
                  isLanded ? "text-slate-900" : "text-white/35"
                }`}
              >
                {i + 1}
              </span>
              {s.rocket ? (
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black text-white"
                  style={{ background: "linear-gradient(160deg,#ff4d5a,#7a0f18)" }}
                >
                  R
                </span>
              ) : (
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${
                    s.shiny ? "/shiny" : ""
                  }/${s.mon.id}.png`}
                  alt=""
                  width={20}
                  height={20}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-5 w-5 shrink-0 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
              <span
                className={`min-w-0 flex-1 truncate text-[11px] font-black uppercase leading-tight tracking-tight ${
                  isLanded ? "text-slate-900" : "text-white/85"
                }`}
              >
                {s.trainer}
              </span>
              <span
                className={`shrink-0 truncate text-[10px] font-bold leading-tight ${
                  isLanded ? "text-slate-700" : "text-white/45"
                }`}
              >
                {s.rocket ? "Team Rocket" : s.mon.name}
              </span>
              {target && !isLanded && <span className="shrink-0 text-[10px]">🎯</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
