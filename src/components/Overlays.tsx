import { useEffect, useRef, useState } from "react";
import {
  MODES,
  MODE_ORDER,
  RARITY,
  TYPE_EMOJI,
  artUrl,
  type Mode,
  type Mon,
  type Segment,
} from "../game/data";
import type { ScoreEntry } from "../game/scores";
import { MonSprite, PokeLogo } from "./Bits";

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`anim-pop relative w-full overflow-hidden rounded-3xl border-4 border-white/25 bg-gradient-to-b from-[#1b2a6b]/95 to-[#0b1020]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,.6)] backdrop-blur-md sm:p-6 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(255,214,59,.35), transparent)",
        }}
      />
      {children}
    </div>
  );
}

export function BigButton({
  children,
  onClick,
  tone = "gold",
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "gold" | "blue" | "ghost";
  className?: string;
}) {
  const tones = {
    gold: "from-amber-300 via-yellow-400 to-orange-500 border-amber-200 text-[#4a2c00] shadow-[0_6px_0_#a3530a,0_12px_24px_rgba(0,0,0,.45)]",
    blue: "from-sky-300 via-blue-500 to-indigo-700 border-sky-200 text-white shadow-[0_6px_0_#1e2a6b,0_12px_24px_rgba(0,0,0,.45)]",
    ghost: "from-white/15 to-white/5 border-white/30 text-white shadow-[0_4px_0_rgba(0,0,0,.35)]",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`btn-poke relative overflow-hidden rounded-2xl border-4 bg-gradient-to-b px-6 py-3 font-logo text-lg tracking-wide sm:text-xl ${tones} ${className}`}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function ScoreTable({
  entries,
  highlight,
  limit = 6,
}: {
  entries: ScoreEntry[];
  highlight?: number;
  limit?: number;
}) {
  const shown = entries.slice(0, limit);
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
          Hall of Fame
        </span>
        <span className="h-px flex-1 bg-white/15" />
      </div>
      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/20 px-3 py-3 text-center text-xs font-bold text-white/40">
          No records yet — be the very best!
        </p>
      ) : (
        <ol className="space-y-1">
          {shown.map((e, i) => (
            <li
              key={`${e.date}-${i}`}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm ${
                highlight === i
                  ? "bg-amber-400/25 ring-2 ring-amber-300"
                  : i % 2
                    ? "bg-white/5"
                    : "bg-white/[0.03]"
              }`}
            >
              <span className="w-5 text-center font-logo text-xs text-white/50">
                {i + 1}
              </span>
              <span className="w-16 shrink-0 truncate font-black tracking-wider text-poke-yellow">
                {e.name}
              </span>
              <span className="flex-1 truncate text-xs font-bold text-white/60">
                {e.best} · Lv {e.level} · {e.caught} catches
              </span>
              <span className="font-logo text-base text-white">
                {e.score.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function StartScreen({
  best,
  entries,
  mode,
  onMode,
  onPlay,
}: {
  best: number;
  entries: ScoreEntry[];
  mode: Mode;
  onMode: (m: Mode) => void;
  onPlay: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto p-3 no-scrollbar">
      <Panel className="max-w-lg text-center">
        <div className="anim-float mx-auto">
          <PokeLogo width={300} className="mx-auto block" />
        </div>
        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.28em] text-sky-200/80">
          Spin · Stop · Catch &rsquo;em all
        </p>

        {/* mode picker */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
              Wheel size
            </span>
            <span className="h-px flex-1 bg-white/15" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MODE_ORDER.map((id) => {
              const m = MODES[id];
              const on = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => onMode(id)}
                  className={`btn-poke rounded-2xl border-2 px-1.5 py-2 text-center transition ${
                    on
                      ? "border-poke-yellow bg-gradient-to-b from-amber-300/90 to-orange-500/90 shadow-[0_4px_0_#a3530a]"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  <div className="text-xl leading-none">{m.emoji}</div>
                  <div
                    className={`mt-0.5 font-logo text-[11px] leading-tight ${
                      on ? "text-amber-950" : "text-white/80"
                    }`}
                  >
                    {m.label}
                  </div>
                  <div
                    className={`text-[9px] font-black uppercase leading-tight ${
                      on ? "text-amber-900" : "text-white/40"
                    }`}
                  >
                    {m.names}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-[10px] font-bold text-white/45">
            {MODES[mode].tagline} · score ×{MODES[mode].scoreMult}
          </p>
        </div>

        <div className="mt-3 grid gap-2 text-left sm:grid-cols-3">
          {[
            { i: "🎯", t: "1. Watch", d: "The wheel never stops spinning." },
            { i: "⚡", t: "2. Tap", d: "SPACE / tap to lock the wheel." },
            { i: "🏆", t: "3. Catch", d: "Land on the target to score." },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-2xl border-2 border-white/15 bg-white/5 p-2.5"
            >
              <div className="text-xl">{c.i}</div>
              <div className="font-logo text-sm text-white">{c.t}</div>
              <div className="text-[11px] font-bold leading-tight text-white/55">
                {c.d}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-2xl border-2 border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[11px] font-bold text-rose-100">
          ⚠️ Avoid <b>Team Rocket</b> wedges and the clock — both cost a Poké Ball.
          Dead-centre stops score a <b>PERFECT</b> bonus!
        </div>

        {mode !== "classic" && (
          <div className="mt-2 rounded-2xl border-2 border-sky-400/40 bg-sky-500/10 px-3 py-2 text-[11px] font-bold text-sky-100">
            📋 Crowded wheels are too packed for readable labels — hit the{" "}
            <b>{MODES[mode].names.replace(" names", "")} NAMES</b> button in game to see
            the full board, and watch the <b>POINTER</b> readout under the wheel.
          </div>
        )}

        <div className="mt-4 flex flex-col items-center gap-2">
          <BigButton onClick={onPlay} className="w-full sm:w-auto">
            ▶ START TRIP
          </BigButton>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            Press <kbd className="rounded bg-white/15 px-1.5 py-0.5">Space</kbd> /{" "}
            <kbd className="rounded bg-white/15 px-1.5 py-0.5">Enter</kbd>
          </div>
        </div>

        <div className="mt-4">
          <ScoreTable entries={entries} />
        </div>
        {best > 0 && (
          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/35">
            Personal best {best.toLocaleString()}
          </p>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PauseScreen({
  onResume,
  onRestart,
  onQuit,
  entries,
}: {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  entries: ScoreEntry[];
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#050814]/70 p-4 backdrop-blur-sm">
      <Panel className="max-w-sm text-center">
        <h2 className="font-logo text-3xl text-white" style={{ textShadow: "0 3px 0 #2a3b9c" }}>
          PAUSED
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          <BigButton onClick={onResume} tone="gold">
            ▶ RESUME
          </BigButton>
          <BigButton onClick={onRestart} tone="blue">
            ↻ RESTART
          </BigButton>
          <BigButton onClick={onQuit} tone="ghost">
            ⏏ QUIT TO MENU
          </BigButton>
        </div>
        <div className="mt-4">
          <ScoreTable entries={entries} limit={4} />
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function GameOverScreen({
  score,
  level,
  caught,
  bestMon,
  isRecord,
  entries,
  onRestart,
  onMenu,
  onSave,
}: {
  score: number;
  level: number;
  caught: number;
  bestMon: Mon | null;
  isRecord: boolean;
  entries: ScoreEntry[];
  onRestart: () => void;
  onMenu: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRecord) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isRecord]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto p-3 no-scrollbar">
      <Panel className="max-w-md text-center">
        <h2
          className="font-logo text-[clamp(2rem,9vw,3rem)] leading-none text-poke-yellow"
          style={{ textShadow: "0 4px 0 #2a3b9c" }}
        >
          GAME OVER
        </h2>
        {isRecord && !saved && (
          <div className="anim-pop mt-1 inline-block rounded-full bg-gradient-to-r from-amber-300 to-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-950">
            ★ New Record ★
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="rounded-2xl border-2 border-white/20 bg-black/35 px-5 py-2">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
              Final Score
            </div>
            <div className="font-logo text-4xl leading-none text-white">{score.toLocaleString()}</div>
          </div>
          <div className="space-y-1 text-left">
            <div className="text-xs font-black text-white/70">
              LEVEL <span className="font-logo text-base text-white">{level}</span>
            </div>
            <div className="text-xs font-black text-white/70">
              CAUGHT <span className="font-logo text-base text-white">{caught}</span>
            </div>
          </div>
        </div>

        {bestMon && (
          <div className="mt-3 flex items-center justify-center gap-3 rounded-2xl border-2 border-white/15 bg-white/5 p-2">
            <img
              src={artUrl(bestMon.id)}
              alt={bestMon.name}
              width={72}
              height={72}
              className="h-[72px] w-[72px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,.5)] anim-float"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="text-left">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
                Top catch
              </div>
              <div className="font-logo text-xl leading-tight text-white">
                {bestMon.name}
              </div>
              <div
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                style={{
                  background: RARITY[bestMon.rarity].color,
                  color: "#0b1020",
                }}
              >
                {RARITY[bestMon.rarity].label}
              </div>
            </div>
          </div>
        )}

        {isRecord && !saved ? (
          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onRestart();
            }}
          >
            <input
              ref={inputRef}
              value={name}
              maxLength={8}
              onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="YOUR NAME"
              className="min-w-0 flex-1 rounded-xl border-2 border-white/25 bg-black/45 px-3 py-2 text-center font-logo text-lg tracking-widest text-poke-yellow outline-none placeholder:text-white/25 focus:border-poke-yellow"
            />
            <button
              type="button"
              onClick={() => {
                setSaved(true);
                onSave(name.trim() || "TRAINER");
              }}
              className="btn-poke shrink-0 rounded-xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-300 to-green-600 px-4 py-2 font-logo text-sm text-emerald-950"
            >
              SAVE
            </button>
          </form>
        ) : null}

        <div className="mt-3">
          <ScoreTable entries={entries} />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <BigButton onClick={onRestart} className="w-full sm:w-auto">
            ↻ PLAY AGAIN
          </BigButton>
          <BigButton onClick={onMenu} tone="ghost" className="w-full sm:w-auto">
            ⌂ MENU
          </BigButton>
        </div>
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
          Press <kbd className="rounded bg-white/15 px-1.5 py-0.5">Enter</kbd> for instant
          restart
        </p>
      </Panel>
    </div>
  );
}



/* ------------------------------------------------------------------ */

export type Outcome =
  | { kind: "catch"; seg: Segment; rating: "PERFECT" | "GREAT" | "GOOD"; gained: number }
  | { kind: "flee"; seg: Segment }
  | { kind: "rocket"; seg: Segment }
  | { kind: "timeout" };

export function ResultCard({
  outcome,
  levelUp,
  ballGain,
  onSkip,
}: {
  outcome: Outcome;
  levelUp: boolean;
  ballGain: boolean;
  onSkip: () => void;
}) {
  const seg = "seg" in outcome ? outcome.seg : null;

  const cfg = {
    catch: {
      title: "GOTCHA!",
      color: "#22c55e",
      emoji: "🎉",
    },
    flee: { title: "IT FLED!", color: "#f97316", emoji: "💨" },
    rocket: { title: "TEAM ROCKET!", color: "#ef4444", emoji: "🚨" },
    timeout: { title: "TOO SLOW!", color: "#ef4444", emoji: "⏰" },
  }[outcome.kind];

  return (
    <div
      className="pointer-events-auto absolute inset-x-0 bottom-2 z-30 flex justify-center px-3"
      onClick={onSkip}
    >
      <div
        className="anim-pop relative w-full max-w-md overflow-hidden rounded-3xl border-4 px-4 py-3 text-center shadow-[0_14px_40px_rgba(0,0,0,.55)]"
        style={{
          borderColor: cfg.color,
          background:
            "linear-gradient(180deg, rgba(14,20,45,.96), rgba(6,9,22,.96))",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 -top-16 h-32 opacity-60 blur-2xl"
          style={{ background: `radial-gradient(50% 100% at 50% 100%, ${cfg.color}, transparent)` }}
        />
        <div className="relative flex items-center gap-3">
          {seg && !seg.rocket && (
            <MonSprite mon={seg.mon} shiny={seg.shiny} size={62} />
          )}
          {seg?.rocket && (
            <div
              className="grid h-[62px] w-[62px] shrink-0 place-items-center rounded-full font-logo text-3xl text-white"
              style={{ background: "linear-gradient(160deg,#ff4d5a,#7a0f18)" }}
            >
              R
            </div>
          )}
          {outcome.kind === "timeout" && (
            <div className="grid h-[62px] w-[62px] shrink-0 place-items-center text-5xl">
              ⏰
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-logo text-2xl leading-none" style={{ color: cfg.color }}>
                {cfg.emoji} {cfg.title}
              </span>
              {outcome.kind === "catch" && outcome.rating === "PERFECT" && (
                <span className="anim-pop rounded-full bg-amber-300 px-2 py-0.5 font-logo text-[11px] text-amber-950">
                  PERFECT
                </span>
              )}
              {outcome.kind === "catch" && outcome.rating === "GREAT" && (
                <span className="rounded-full bg-sky-300 px-2 py-0.5 font-logo text-[11px] text-sky-950">
                  GREAT
                </span>
              )}
            </div>
            {seg && (
              <div className="mt-0.5 truncate text-xs font-black uppercase tracking-wider text-white/60">
                {seg.rocket
                  ? "They stole your Poké Ball!"
                  : `${seg.mon.name}${seg.shiny ? " ✨SHINY✨" : ""} · ${seg.trainer} · ${
                      TYPE_EMOJI[seg.mon.types[0]] ?? ""
                    } ${seg.mon.types.join("/")}`}
              </div>
            )}
            {outcome.kind === "timeout" && (
              <div className="mt-0.5 text-xs font-black uppercase tracking-wider text-white/60">
                The wild Pokémon ran away!
              </div>
            )}
            {outcome.kind === "catch" && (
              <div className="mt-1 font-logo text-2xl leading-none text-poke-yellow">
                +{outcome.gained.toLocaleString()}
              </div>
            )}
          </div>
        </div>
        {(levelUp || ballGain) && (
          <div className="relative mt-2 flex flex-wrap justify-center gap-1.5">
            {levelUp && (
              <span className="anim-pop rounded-full bg-gradient-to-r from-sky-300 to-indigo-500 px-3 py-1 font-logo text-xs text-white">
                LEVEL UP!
              </span>
            )}
            {ballGain && (
              <span className="anim-pop rounded-full bg-gradient-to-r from-emerald-300 to-green-600 px-3 py-1 font-logo text-xs text-emerald-950">
                +1 POKÉ BALL
              </span>
            )}
          </div>
        )}
        <div className="relative mt-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
          Tap / Space to continue
        </div>
      </div>
    </div>
  );
}
