import { objectiveLabel, type Objective } from "../game/data";
import { PokeballIcon } from "./Bits";

export function TopBar({
  score,
  best,
  combo,
  level,
  lives,
  muted,
  modeLabel,
  modeNames,
  onPause,
  onMute,
  scoreKey,
}: {
  score: number;
  best: number;
  combo: number;
  level: number;
  lives: number;
  muted: boolean;
  modeLabel: string;
  modeNames: string;
  onPause: () => void;
  onMute: () => void;
  scoreKey: number;
}) {
  const mult = Math.min(5, 1 + combo * 0.25);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2 sm:p-3">
      {/* left: level + combo */}
      <div className="flex flex-col items-start gap-1.5">
        <div className="rounded-2xl border-2 border-white/25 bg-black/35 px-3 py-1.5 backdrop-blur-sm">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
            Level
          </div>
          <div className="font-logo text-2xl leading-none text-poke-yellow">{level}</div>
          <div className="text-[8px] font-black uppercase tracking-[0.12em] text-white/40">
            {modeLabel} · {modeNames}
          </div>
        </div>
        {combo > 1 && (
          <div
            key={combo}
            className="anim-pop rounded-xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-400 to-orange-600 px-2.5 py-1 shadow-lg shadow-orange-900/40"
          >
            <span className="font-logo text-lg leading-none text-white">
              {combo} STREAK
            </span>
            <span className="ml-1.5 text-xs font-black text-yellow-100">
              ×{mult.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* center: score */}
      <div className="flex flex-col items-center">
        <div className="rounded-2xl border-2 border-white/25 bg-black/35 px-4 py-1.5 text-center backdrop-blur-sm">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/55">
            Score
          </div>
          <div
            key={scoreKey}
            className="anim-score font-logo text-[clamp(1.5rem,6vw,2.5rem)] leading-none text-white"
            style={{ textShadow: "0 3px 0 #2a3b9c, 0 0 18px rgba(255,214,59,.55)" }}
          >
            {score.toLocaleString()}
          </div>
        </div>
        <div className="mt-1 rounded-full bg-black/35 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/65">
          Best {best.toLocaleString()}
        </div>
      </div>

      {/* right: lives + buttons */}
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex gap-1 rounded-2xl border-2 border-white/25 bg-black/35 px-2.5 py-1.5 backdrop-blur-sm">
          {[0, 1, 2, 3, 4].slice(0, Math.max(3, lives)).map((i) => (
            <PokeballIcon
              key={i}
              size={18}
              className={i < lives ? "" : "opacity-25 grayscale"}
            />
          ))}
        </div>
        <div className="pointer-events-auto flex gap-1.5">
          <button
            onClick={onMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="btn-poke grid h-9 w-9 place-items-center rounded-xl border-2 border-white/25 bg-black/40 text-lg backdrop-blur-sm"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={onPause}
            aria-label="Pause"
            className="btn-poke grid h-9 w-9 place-items-center rounded-xl border-2 border-white/25 bg-black/40 text-white backdrop-blur-sm"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1.5" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ObjectiveBanner({
  objective,
  jackpot,
}: {
  objective: Objective;
  jackpot: boolean;
}) {
  const o = objectiveLabel(objective);
  return (
    <div
      className={`anim-pop relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 px-3 py-1.5 shadow-lg ${
        jackpot
          ? "border-amber-300 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500"
          : "border-white/30 bg-black/45 backdrop-blur-sm"
      }`}
    >
      {jackpot && <div className="absolute inset-0 anim-shine" aria-hidden />}
      <span className="text-xl leading-none">{o.emoji}</span>
      <div className="leading-tight">
        <div
          className={`text-[9px] font-black uppercase tracking-[0.16em] ${
            jackpot ? "text-amber-900" : "text-white/55"
          }`}
        >
          Target
        </div>
        <div
          className={`font-logo text-[clamp(0.85rem,3.4vw,1.15rem)] leading-none ${
            jackpot ? "text-amber-950" : "text-white"
          }`}
        >
          {o.title}
        </div>
      </div>
    </div>
  );
}

export function TimerBar({
  barRef,
  textRef,
  urgent,
}: {
  barRef: React.RefObject<HTMLDivElement | null>;
  textRef: React.RefObject<HTMLSpanElement | null>;
  urgent: boolean;
}) {
  return (
    <div className="flex w-full max-w-md items-center gap-2">
      <span
        ref={textRef}
        className={`font-logo text-lg leading-none tabular-nums ${
          urgent ? "text-red-400 anim-blink" : "text-white/80"
        }`}
      >
        9.0
      </span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full border-2 border-white/25 bg-black/45">
        <div
          ref={barRef}
          className="absolute inset-y-0 left-0 w-full origin-left rounded-full"
          style={{
            background: urgent
              ? "linear-gradient(90deg,#ef4444,#f97316)"
              : "linear-gradient(90deg,#34d399,#22d3ee)",
            transform: "scaleX(1)",
          }}
        />
      </div>
    </div>
  );
}
