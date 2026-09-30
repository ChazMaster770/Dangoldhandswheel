import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TYPE_COLORS } from "../game/data";
import { initAudio, isMuted, sfx, toggleMute } from "../game/audio";
import { Particles } from "../game/particles";
import {
  makeDrawId,
  parseNames,
  savePickerState,
  secureFloat,
  shuffled,
  totalWeight,
  weightedPick,
  type Entry,
  type PickerSettings,
  type Winner,
} from "../game/names";
import { loadPickerState } from "../game/names";
import { PickerWheel } from "../components/PickerWheel";
import { EntriesPanel } from "../components/EntriesPanel";
import { WinnerCard, WinnersPanel } from "../components/WinnersPanel";
import { BrandBackdrop, LogoBadge, PokeLogo } from "../components/Bits";
import { BRAND, DEFAULT_LOGO, resetLogo, setLogoFromFile, useLogo } from "../game/brand";

const GOLD = "#ffd93b";

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type Tab = "names" | "winners";

export function PickerScreen({ onArcade }: { onArcade: () => void }) {
  /* ---------------- persisted state ---------------- */
  const boot = useMemo(() => loadPickerState(), []);
  const [text, setText] = useState(boot.text);
  const [settings, setSettings] = useState<PickerSettings>(boot.settings);
  const [winners, setWinners] = useState<Winner[]>(boot.winners);
  const [removed, setRemoved] = useState<string[]>(boot.removed);

  /* ---------------- ui state ---------------- */
  const [tab, setTab] = useState<Tab>("names");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [muted, setMuted] = useState(isMuted());
  const [size, setSize] = useState(360);
  const [landed, setLanded] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [reveal, setReveal] = useState<{
    entry: Entry;
    winner: Winner;
    ordinal: number;
    ofCount: number;
    queue: number;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  /* ---------------- derived ---------------- */
  const parsed = useMemo(
    () => parseNames(text, { countDuplicates: settings.countDuplicates }),
    [text, settings.countDuplicates],
  );
  const removedSet = useMemo(() => new Set(removed), [removed]);
  const active = useMemo(
    () => parsed.entries.filter((e) => !removedSet.has(e.id)),
    [parsed.entries, removedSet],
  );
  const chances = useMemo(() => totalWeight(active), [active]);

  /* ---------------- refs ---------------- */
  const particles = useMemo(() => new Particles(), []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shakeRef = useRef<HTMLDivElement | null>(null);
  const spinRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const customLogo = useLogo() !== DEFAULT_LOGO;
  const [logoHint, setLogoHint] = useState(() => {
    try {
      return localStorage.getItem("dgh.logo.hint") !== "off";
    } catch {
      return true;
    }
  });
  const dismissHint = () => {
    try {
      localStorage.setItem("dgh.logo.hint", "off");
    } catch {
      /* ignore */
    }
    setLogoHint(false);
  };

  const activeRef = useRef<Entry[]>(active);
  const spinningRef = useRef(false);
  const settingsRef = useRef(settings);
  const winnersRef = useRef<Winner[]>(winners);
  const drawQueueRef = useRef(0);
  const drawTotalRef = useRef(1);

  activeRef.current = active;
  settingsRef.current = settings;
  winnersRef.current = winners;

  const eng = useRef({
    rot: Math.random() * 360,
    from: 0,
    to: 0,
    t: 0,
    dur: 5,
    mode: "idle" as "idle" | "spin",
    lastIdx: -1,
    shake: 0,
    flash: 0,
    labelOpacity: 1,
    trailAcc: 0,
    revealIdx: -1,
  });

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    savePickerState({ text, settings, winners, removed });
  }, [text, settings, winners, removed]);

  /* ---------------- sizing ---------------- */
  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const wide = vw >= 1024;
      const reserved = vh < 620 ? 210 : 288;
      const avail = wide ? vw - 340 : vw - 20;
      setSize(Math.round(Math.max(180, Math.min(avail, vh - reserved, 470))));
    };
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    particles.attach(canvasRef.current!);
    const onResize = () => particles.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [particles]);

  const flash = useCallback((v: number) => {
    eng.current.flash = Math.max(eng.current.flash, v);
  }, []);

  const celebrate = useCallback(
    (entry: Entry, big: boolean) => {
      const el = spinRef.current;
      const x = el ? el.getBoundingClientRect().left + el.clientWidth / 2 : window.innerWidth / 2;
      const y = el ? el.getBoundingClientRect().top + el.clientHeight / 2 : window.innerHeight / 2;
      const colors = [
        GOLD,
        "#fff3b0",
        TYPE_COLORS[entry.mon.types[0]] ?? "#7ac74c",
        TYPE_COLORS[entry.mon.types[1] ?? entry.mon.types[0]] ?? "#ffffff",
        "#ffffff",
      ];
      particles.burst(x, y, colors, big ? 80 : 52, big ? 1.4 : 1);
      particles.fountain(x, y + 10, colors, big ? 100 : 60);
      particles.ring(x, y, GOLD, 18);
      particles.balls(x, y, colors, big ? 18 : 10);
    },
    [particles],
  );

  /* ---------------- the draw ---------------- */
  const commitWinner = useCallback(
    (idx: number) => {
      const list = activeRef.current;
      const entry = list[idx];
      if (!entry) return;
      const st = settingsRef.current;
      const ordinal = winnersRef.current.length + 1;
      const winner: Winner = {
        id: entry.id,
        name: entry.name,
        monId: entry.mon.id,
        monName: entry.mon.name,
        at: Date.now(),
        drawId: makeDrawId(),
        ordinal,
      };

      const nextWinners = [...winnersRef.current, winner];
      winnersRef.current = nextWinners;
      setWinners(nextWinners);

      if (st.removeWinners) {
        setRemoved((r) => (r.includes(entry.id) ? r : [...r, entry.id]));
      }

      const legendary = entry.mon.rarity === "legendary";
      if (legendary) {
        sfx.legendary();
        eng.current.shake = 26;
        flash(0.85);
      } else {
        sfx.perfect();
        eng.current.shake = 18;
        flash(0.4);
      }
      celebrate(entry, legendary);

      setReveal({
        entry,
        winner,
        ordinal,
        ofCount: drawTotalRef.current,
        queue: drawQueueRef.current,
      });
    },
    [celebrate, flash],
  );

  const spin = useCallback(() => {
    if (spinningRef.current) return;
    const list = activeRef.current;
    if (list.length === 0) {
      setToast("Add some names first!");
      setTimeout(() => setToast(null), 1800);
      return;
    }
    initAudio();
    sfx.whoosh();

    const e = eng.current;
    const count = list.length;
    const A = 360 / count;

    // 1. decide the winner with crypto randomness — before any animation
    const idx = weightedPick(list);

    // 2. work out where to stop so that wedge sits under the pointer
    //    (cosmetic only — the winner is already locked in above)
    const thetaTarget = (idx + 0.12 + secureFloat() * 0.76) * A;
    const base = -thetaTarget;
    const dir = secureFloat() < 0.5 ? 1 : -1;
    const turns = 5 + Math.floor(secureFloat() * 3);

    let target: number;
    if (dir > 0) {
      const delta = (((base - e.rot) % 360) + 360) % 360;
      target = e.rot + delta + turns * 360;
    } else {
      const delta = (((e.rot - base) % 360) + 360) % 360;
      target = e.rot - delta - turns * 360;
    }

    e.from = e.rot;
    e.to = target;
    e.t = 0;
    e.dur = 4.6 + Math.random() * 0.8;
    e.mode = "spin";
    e.lastIdx = -1;
    e.revealIdx = idx;

    spinningRef.current = true;
    setSpinning(true);
    setLanded(null);
    setReveal(null);
  }, []);

  /* ---------------- main loop ---------------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastTickAt = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.0005, (now - last) / 1000));
      last = now;
      const e = eng.current;
      const list = activeRef.current;
      const count = Math.max(1, list.length);
      const A = 360 / count;

      if (e.mode === "spin") {
        e.t += dt;
        const p = Math.min(1, e.t / e.dur);
        e.rot = e.from + (e.to - e.from) * easeInOutCubic(p);
        const theta = ((-e.rot % 360) + 360) % 360;
        const idx = Math.floor(theta / A) % count;
        if (idx !== e.lastIdx) {
          e.lastIdx = idx;
          const speed = Math.abs(e.to - e.from) / e.dur;
          if (now - lastTickAt > 62) {
            lastTickAt = now;
            sfx.tick(speed * 0.5);
          }
        }
        e.labelOpacity = Math.max(0.5, 1 - easeInOutCubic(p) * 0.45);

        // spark trail from the pointer
        e.trailAcc += dt;
        if (e.trailAcc > 0.04) {
          e.trailAcc = 0;
          const el = spinRef.current;
          if (el) {
            const r = el.getBoundingClientRect();
            particles.trail(r.left + r.width / 2, r.top + 6, Math.random() < 0.5 ? GOLD : "#fff");
          }
        }

        if (p >= 1) {
          e.rot = e.to;
          e.mode = "idle";
          e.shake = 10;
          sfx.lock();
          spinningRef.current = false;
          setSpinning(false);
          setLanded(e.revealIdx);
          window.setTimeout(() => commitWinner(e.revealIdx), 220);
        }
      } else {
        e.labelOpacity = Math.min(1, e.labelOpacity + dt * 3);
      }

      if (spinRef.current) spinRef.current.style.transform = `rotate(${e.rot.toFixed(2)}deg)`;
      if (labelRef.current) labelRef.current.style.opacity = e.labelOpacity.toFixed(2);

      if (e.shake > 0.05) {
        e.shake *= Math.pow(0.0025, dt);
        const m = e.shake;
        if (shakeRef.current)
          shakeRef.current.style.transform = `translate3d(${((Math.random() - 0.5) * m * 2).toFixed(
            1,
          )}px,${((Math.random() - 0.5) * m * 2).toFixed(1)}px,0) rotate(${(
            (Math.random() - 0.5) *
            m *
            0.22
          ).toFixed(2)}deg)`;
      } else if (e.shake !== 0) {
        e.shake = 0;
        if (shakeRef.current) shakeRef.current.style.transform = "";
      }

      if (e.flash > 0.005) {
        e.flash *= Math.pow(0.0004, dt);
        if (flashRef.current) flashRef.current.style.opacity = e.flash.toFixed(3);
      } else if (e.flash !== 0) {
        e.flash = 0;
        if (flashRef.current) flashRef.current.style.opacity = "0";
      }

      particles.update(dt);
      particles.render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [commitWinner, particles]);

  /* ---------------- actions ---------------- */
  const closeReveal = useCallback(() => {
    setReveal(null);
    // if the winner was removed the wedge list changed, so drop the highlight
    if (settingsRef.current.removeWinners) setLanded(null);
    if (drawQueueRef.current > 0) {
      drawQueueRef.current -= 1;
      window.setTimeout(() => spin(), 260);
    }
  }, [spin]);

  const startDraw = useCallback(
    (count: number) => {
      drawTotalRef.current = count;
      drawQueueRef.current = count - 1;
      spin();
    },
    [spin],
  );

  const primary = useCallback(() => {
    if (reveal) {
      closeReveal();
      return;
    }
    startDraw(settingsRef.current.drawCount);
  }, [closeReveal, reveal, startDraw]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (ev.code === "Space" || ev.key === " ") {
        ev.preventDefault();
        if (ev.repeat) return;
        primary();
        return;
      }
      if (ev.code === "Enter") {
        if (reveal) {
          ev.preventDefault();
          closeReveal();
        }
        return;
      }
      if (ev.key === "Escape") {
        if (reveal) closeReveal();
        else setSheetOpen(false);
        return;
      }
      if (ev.key === "m" || ev.key === "M") setMuted(toggleMute());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeReveal, primary, reveal]);

  const toggleFullscreen = () => {
    const d = document as Document & { webkitExitFullscreen?: () => void };
    if (!document.fullscreenElement) {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => void;
      };
      el.requestFullscreen?.().catch(() => {}) ?? el.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ?? d.webkitExitFullscreen?.();
    }
  };

  const toastEl = toast && (
    <div
      className={`anim-pop pointer-events-none absolute left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl border-2 px-4 py-2 font-logo text-white ${
        toast.startsWith("✅")
          ? "border-emerald-200 bg-emerald-500/95"
          : "border-rose-300 bg-rose-500/95"
      }`}
    >
      {toast}
    </div>
  );

  return (
    <div className="arena-bg fixed inset-0 overflow-hidden">
      <BrandBackdrop />
      <div ref={shakeRef} className="absolute inset-0 will-change-transform">
        <div className="absolute inset-0 flex flex-col">
          {/* header */}
          <header className="z-30 flex items-center gap-2 p-2 sm:p-3">
            <LogoBadge size={44} className="shrink-0" />
            <div className="flex min-w-0 flex-col leading-none">
              <PokeLogo width={190} className="hidden sm:block" />
              <PokeLogo width={128} className="sm:hidden" />
              <span
                dir="rtl"
                className="mt-0.5 hidden text-[11px] font-black text-amber-200/80 sm:block"
              >
                {BRAND.hebrew} · {BRAND.tagline}
              </span>
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (ev) => {
                const f = ev.target.files?.[0];
                ev.target.value = "";
                if (!f) return;
                try {
                  await setLogoFromFile(f);
                  sfx.perfect();
                  setToast("✅ Logo updated!");
                } catch (err) {
                  setToast((err as Error).message);
                }
                setTimeout(() => setToast(null), 1800);
              }}
            />

            <div className="ml-auto flex items-center gap-1.5">
              <div className="hidden items-center gap-1 rounded-2xl border-2 border-white/20 bg-black/35 p-1 backdrop-blur-sm sm:flex">
                <span className="px-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-white/40">
                  Winners
                </span>
                {[1, 2, 3, 5, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      sfx.ui();
                      setSettings((s) => ({ ...s, drawCount: n }));
                    }}
                    className={`h-7 w-7 rounded-xl font-logo text-sm leading-none transition ${
                      settings.drawCount === n
                        ? "bg-gradient-to-b from-amber-300 to-orange-500 text-amber-950"
                        : "text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                onClick={() => logoInputRef.current?.click()}
                title="Upload your channel logo for the centre of the wheel"
                className="btn-poke rounded-xl border-2 border-amber-300/60 bg-gradient-to-b from-amber-300/30 to-orange-600/40 px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100 backdrop-blur-sm"
              >
                🖼<span className="hidden sm:inline"> Logo</span>
              </button>
              {customLogo && (
                <button
                  onClick={() => {
                    resetLogo();
                    sfx.ui();
                  }}
                  title="Restore the default logo"
                  className="btn-poke hidden rounded-xl border-2 border-white/20 bg-black/40 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white/60 backdrop-blur-sm sm:block"
                >
                  ↺
                </button>
              )}
              <button
                onClick={() => setMuted(toggleMute())}
                aria-label={muted ? "Unmute" : "Mute"}
                className="btn-poke grid h-9 w-9 place-items-center rounded-xl border-2 border-white/25 bg-black/40 text-lg backdrop-blur-sm"
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <button
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
                title="Fullscreen (great for live draws)"
                className="btn-poke hidden h-9 w-9 place-items-center rounded-xl border-2 border-white/25 bg-black/40 text-white backdrop-blur-sm sm:grid"
              >
                ⛶
              </button>
              <button
                onClick={onArcade}
                className="btn-poke rounded-xl border-2 border-sky-300/50 bg-gradient-to-b from-sky-400/40 to-blue-700/50 px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm"
              >
                🎮<span className="hidden sm:inline"> Arcade</span>
              </button>
            </div>
          </header>

          {!customLogo && logoHint && (
            <div className="mx-2 mb-1 flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-1.5 text-[11px] leading-snug text-amber-100/90 backdrop-blur-sm sm:mx-3">
              <span aria-hidden>🖼</span>
              <span className="min-w-0">
                <b className="text-amber-200">Use your logo picture</b> — tap <b>🖼 Logo</b> above and
                pick it: the round badge goes in the middle of the wheel and the same picture
                becomes the background.
              </span>
              <button
                onClick={dismissHint}
                aria-label="Dismiss logo hint"
                className="ml-auto shrink-0 rounded-lg px-2 py-1 text-white/50 transition hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* body */}
          <main className="flex min-h-0 flex-1 gap-3 px-2 pb-2 sm:px-3">
            {/* wheel column */}
            <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3">
              <div
                className="relative"
                onPointerDown={(ev) => {
                  if ((ev.target as HTMLElement).closest("button")) return;
                  primary();
                }}
              >
                <PickerWheel
                  entries={active}
                  size={size}
                  spinRef={spinRef}
                  labelRef={labelRef}
                  landed={landed}
                  spinning={spinning}
                  showPokemon={settings.showPokemon}
                />
              </div>

              <div className="flex w-full max-w-md flex-col items-center gap-2">
                <div className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/15 bg-black/35 px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                    {active.length} names
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                    {chances.toLocaleString()} chances
                  </span>
                  {removed.length > 0 && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300/70">
                        {removed.length} drawn
                      </span>
                    </>
                  )}
                  {settings.drawCount > 1 && !settings.removeWinners && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-300/80">
                        ⚠ may repeat
                      </span>
                    </>
                  )}
                  {active.length > 150 && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                        sprites off
                      </span>
                    </>
                  )}
                  <span className="ml-auto text-[10px]">🔒 crypto-random</span>
                </div>

                <button
                  onClick={() => primary()}
                  disabled={spinning || active.length === 0}
                  className="btn-poke relative w-full overflow-hidden rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-500 px-6 py-4 font-logo text-2xl tracking-wide text-amber-950 shadow-[0_7px_0_#a3530a,0_16px_30px_rgba(0,0,0,.5)] disabled:opacity-50 sm:text-3xl"
                >
                  <span className="relative z-10">
                    {spinning
                      ? "SPINNING…"
                      : reveal
                        ? "CONTINUE"
                        : settings.drawCount > 1
                          ? `SPIN ${settings.drawCount} WINNERS`
                          : "🎡 SPIN"}
                  </span>
                </button>

                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                  {spinning
                    ? "Good luck…"
                    : reveal
                      ? "Press Space to continue"
                      : "Press Space or tap the wheel"}
                </p>
              </div>

              {/* mobile panel trigger */}
              <button
                onClick={() => {
                  sfx.ui();
                  setSheetOpen(true);
                }}
                className="btn-poke rounded-2xl border-2 border-white/25 bg-black/45 px-4 py-2.5 font-logo text-base text-white backdrop-blur-sm lg:hidden"
              >
                📋 NAMES &amp; WINNERS
              </button>
            </section>

            {/* desktop side panel */}
            <aside className="hidden w-[312px] shrink-0 flex-col rounded-3xl border-2 border-white/12 bg-black/25 p-2 backdrop-blur-sm lg:flex">
              <div className="mb-2 grid grid-cols-2 gap-1 rounded-2xl bg-black/40 p-1">
                {(["names", "winners"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      sfx.ui();
                      setTab(t);
                    }}
                    className={`rounded-xl py-1.5 font-logo text-xs uppercase transition ${
                      tab === t
                        ? "bg-gradient-to-b from-sky-300 to-blue-600 text-white"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {t === "names" ? "📋 Names" : "🏆 Winners"}
                  </button>
                ))}
              </div>

              {tab === "names" ? (
                <EntriesPanel
                  text={text}
                  entries={parsed.entries}
                  removed={removed}
                  settings={settings}
                  setSettings={setSettings}
                  onApply={(t) => {
                    setRemoved([]);
                    setText(t);
                  }}
                  onShuffle={() => {
                    sfx.ui();
                    setText(
                      shuffled(parsed.entries)
                        .map((e) => e.name + (e.weight > 1 ? ` x${e.weight}` : ""))
                        .join("\n"),
                    );
                  }}
                  onSort={() => {
                    sfx.ui();
                    setText(
                      parsed.entries
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((e) => e.name + (e.weight > 1 ? ` x${e.weight}` : ""))
                        .join("\n"),
                    );
                  }}
                  onRemoveName={(e) => setRemoved((r) => [...r, e.id])}
                  onClearWinners={() => {
                    setWinners([]);
                    setRemoved([]);
                  }}
                  winnerCount={winners.length}
                />
              ) : (
                <WinnersPanel
                  winners={winners}
                  total={chances}
                  onUndo={() => {
                    const last = winners[winners.length - 1];
                    if (!last) return;
                    setWinners((w) => w.slice(0, -1));
                    setRemoved((r) => r.filter((id) => id !== last.id));
                    setLanded(null);
                    sfx.ui();
                  }}
                  onClear={() => {
                    setWinners([]);
                    setRemoved([]);
                    sfx.ui();
                  }}
                />
              )}
            </aside>
          </main>
        </div>
      </div>

      {/* flash + particles */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 z-30 bg-white"
        style={{ opacity: 0 }}
      />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-40" />
      {toastEl}

      {/* mobile sheet */}
      {sheetOpen && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#050814]/95 p-3 backdrop-blur-md lg:hidden">
          <div className="mb-2 flex items-center gap-2">
            <div className="grid flex-1 grid-cols-2 gap-1 rounded-2xl bg-black/50 p-1">
              {(["names", "winners"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-xl py-2 font-logo text-xs uppercase transition ${
                    tab === t
                      ? "bg-gradient-to-b from-sky-300 to-blue-600 text-white"
                      : "text-white/50"
                  }`}
                >
                  {t === "names" ? "📋 Names" : "🏆 Winners"}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                sfx.ui();
                setSheetOpen(false);
              }}
              className="btn-poke grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-white/25 bg-white/10 text-lg font-black text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {tab === "names" ? (
              <EntriesPanel
                text={text}
                entries={parsed.entries}
                removed={removed}
                settings={settings}
                setSettings={(s) => setSettings(s)}
                onApply={(t) => {
                  setRemoved([]);
                  setText(t);
                }}
                onShuffle={() => {
                  sfx.ui();
                  setText(
                    shuffled(parsed.entries)
                      .map((e) => e.name + (e.weight > 1 ? ` x${e.weight}` : ""))
                      .join("\n"),
                  );
                }}
                onSort={() => {
                  sfx.ui();
                  setText(
                    parsed.entries
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((e) => e.name + (e.weight > 1 ? ` x${e.weight}` : ""))
                      .join("\n"),
                  );
                }}
                onRemoveName={(e) => setRemoved((r) => [...r, e.id])}
                onClearWinners={() => {
                  setWinners([]);
                  setRemoved([]);
                }}
                winnerCount={winners.length}
              />
            ) : (
              <WinnersPanel
                winners={winners}
                total={chances}
                onUndo={() => {
                  const last = winners[winners.length - 1];
                  if (!last) return;
                  setWinners((w) => w.slice(0, -1));
                  setRemoved((r) => r.filter((id) => id !== last.id));
                  setLanded(null);
                }}
                onClear={() => {
                  setWinners([]);
                  setRemoved([]);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* winner reveal */}
      {reveal && (
        <WinnerCard
          entry={reveal.entry}
          winner={reveal.winner}
          total={chances}
          ordinal={reveal.ordinal}
          ofCount={reveal.ofCount}
          queue={reveal.queue}
          onClose={closeReveal}
          onAgain={() => {
            setReveal(null);
            if (drawQueueRef.current > 0) drawQueueRef.current -= 1;
            window.setTimeout(() => spin(), 260);
          }}
        />
      )}
    </div>
  );
}
