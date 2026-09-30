import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MODES,
  RARITY,
  TYPE_COLORS,
  buildRound,
  matches,
  preloadSprites,
  spriteUrl,
  type Mode,
  type Mon,
  type Objective,
  type Round,
} from "./game/data";
import { initAudio, isMuted, sfx, toggleMute } from "./game/audio";
import { Particles } from "./game/particles";
import { bestScore, loadScores, saveScore, type ScoreEntry } from "./game/scores";
import { BrandBackdrop } from "./components/Bits";
import { Wheel } from "./components/Wheel";
import { PickerScreen } from "./components/PickerScreen";
import { NameList } from "./components/NameList";
import { ObjectiveBanner, TimerBar, TopBar } from "./components/Hud";
import {
  GameOverScreen,
  PauseScreen,
  ResultCard,
  StartScreen,
  type Outcome,
} from "./components/Overlays";

type Phase = "menu" | "playing" | "result" | "paused" | "gameover";

const GOLD = "#ffd93b";

function easeOutBack(t: number) {
  const c1 = 2.1;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** The arcade mini-game — a bonus mode alongside the giveaway picker. */
export function GameScreen({ onExit }: { onExit: () => void }) {
  /* ---------------- state ---------------- */
  const [phase, setPhase] = useState<Phase>("menu");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [caught, setCaught] = useState(0);
  const [round, setRound] = useState<Round>(() => buildRound(1, "classic"));
  const [mode, setMode] = useState<Mode>("classic");
  const [showNames, setShowNames] = useState(false);
  const [landed, setLanded] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [ballGain, setBallGain] = useState(false);
  const [bestMon, setBestMon] = useState<Mon | null>(null);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [isRecord, setIsRecord] = useState(false);
  const [muted, setMuted] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [scoreKey, setScoreKey] = useState(0);
  const [size, setSize] = useState(360);
  const [best, setBest] = useState(0);

  /* ---------------- refs ---------------- */
  const particles = useMemo(() => new Particles(), []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shakeRef = useRef<HTMLDivElement | null>(null);
  const spinRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const advanceTimer = useRef<number | null>(null);

  const liveNameRef = useRef<HTMLSpanElement | null>(null);
  const liveImgRef = useRef<HTMLImageElement | null>(null);

  const phaseRef = useRef<Phase>("menu");
  const roundRef = useRef<Round>(round);
  const modeRef = useRef<Mode>("classic");
  const showNamesRef = useRef(false);
  const stateRef = useRef({ score: 0, lives: 3, combo: 0, level: 1, caught: 0 });

  const eng = useRef({
    rot: 0,
    vel: 160,
    dir: 1 as 1 | -1,
    mode: "idle" as "idle" | "spin" | "settle",
    from: 0,
    to: 0,
    t: 0,
    dur: 0.4,
    celebrated: false,
    lastIdx: -1,
    timeLeft: 9,
    timeTotal: 9,
    shake: 0,
    flash: 0,
    labelOpacity: 1,
    trailAcc: 0,
    roundT: 0,
    pending: null as null | {
      idx: number;
      rating: "PERFECT" | "GREAT" | "GOOD";
    },
  });

  /* keep refs in sync */
  phaseRef.current = phase;
  roundRef.current = round;
  modeRef.current = mode;
  showNamesRef.current = showNames;
  stateRef.current = { score, lives, combo, level, caught };

  /* ---------------- sizing ---------------- */
  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const reserved = vh < 520 ? 140 : vh < 700 ? 235 : 300;
      const s = Math.max(180, Math.min((vw - 18) / 1.13, vh - reserved, 470));
      setSize(Math.round(s));
    };
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  /* ---------------- mount ---------------- */
  useEffect(() => {
    setEntries(loadScores());
    setBest(bestScore());
    setMuted(isMuted());
    particles.attach(canvasRef.current!);
    const onResize = () => particles.resize();
    window.addEventListener("resize", onResize);
    preloadSprites();
    return () => window.removeEventListener("resize", onResize);
  }, [particles]);

  /* ---------------- helpers ---------------- */
  const wheelCenter = useCallback(() => {
    const el = spinRef.current;
    if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const bestValRef = useRef(0);

  const celebrate = useCallback(
    (mon: Mon, big: boolean) => {
      const { x, y } = wheelCenter();
      const colors = [
        GOLD,
        "#fff3b0",
        TYPE_COLORS[mon.types[0]] ?? "#7ac74c",
        TYPE_COLORS[mon.types[1] ?? mon.types[0]] ?? "#ffffff",
        "#ffffff",
      ];
      particles.burst(x, y, colors, big ? 70 : 44, big ? 1.35 : 1);
      particles.fountain(x, y + 10, colors, big ? 90 : 50);
      particles.ring(x, y, colors[0], 16);
      particles.balls(x, y, colors, big ? 16 : 9);
    },
    [particles, wheelCenter],
  );

  const failBurst = useCallback(
    (color: string) => {
      const { x, y } = wheelCenter();
      particles.burst(x, y, [color, "#ffffff", "#94a3b8"], 34, 0.85);
      particles.ring(x, y, color, 14);
    },
    [particles, wheelCenter],
  );

  /* ---------------- round flow ---------------- */
  const beginRound = useCallback(
    (lvl: number, oldLives: number) => {
      const r = buildRound(lvl, modeRef.current);
      const e = eng.current;
      e.rot = Math.random() * 360;
      e.vel = r.velocity;
      e.dir = r.direction;
      e.mode = "spin";
      e.timeLeft = r.duration;
      e.timeTotal = r.duration;
      e.lastIdx = -1;
      e.pending = null;
      e.celebrated = false;
      e.roundT = 0;
      setRound(r);
      setLanded(null);
      setOutcome(null);
      setLevelUp(false);
      setBallGain(false);
      setUrgent(false);
      setLives(oldLives);
      setShowNames(false);
      setPhase("playing");
      sfx.whoosh();
    },
    [],
  );

  const startGame = useCallback(() => {
    initAudio();
    sfx.ui();
    particles.clear();
    modeRef.current = mode;
    bestValRef.current = 0;
    setScore(0);
    setCombo(0);
    setLevel(1);
    setCaught(0);
    setLives(3);
    setBestMon(null);
    setIsRecord(false);
    setScoreKey((k) => k + 1);
    stateRef.current = { score: 0, lives: 3, combo: 0, level: 1, caught: 0 };
    beginRound(1, 3);
  }, [beginRound, mode, particles]);

  const goMenu = useCallback(() => {
    setPhase("menu");
    setOutcome(null);
    setLanded(null);
    particles.clear();
  }, [particles]);

  const endGame = useCallback(() => {
    const s = stateRef.current.score;
    const b = bestScore();
    setPhase("gameover");
    setOutcome(null);
    sfx.gameOver();
    if (s > b) setIsRecord(true);
    const e = eng.current;
    e.mode = "idle";
    particles.burst(
      window.innerWidth / 2,
      window.innerHeight / 2,
      ["#ef4444", "#f97316", "#ffffff"],
      46,
      1.1,
    );
  }, [particles]);

  const finishResolve = useCallback(
    (res: Outcome, nextLives: number, nextScore: number) => {
      setOutcome(res);
      setLives(nextLives);
      setScore(nextScore);
      setScoreKey((k) => k + 1);
      if (nextLives <= 0) {
        window.setTimeout(() => endGame(), 700);
      } else {
        setPhase("result");
        if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
        advanceTimer.current = window.setTimeout(() => {
          if (phaseRef.current === "result") advance();
        }, 1750);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endGame],
  );

  const advance = useCallback(() => {
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (phaseRef.current !== "result") return;
    const s = stateRef.current;
    beginRound(s.level, s.lives);
  }, [beginRound]);

  /* ---------------- stop / resolve ---------------- */
  const doStop = useCallback(() => {
    const e = eng.current;
    if (e.mode !== "spin") return;
    const count = roundRef.current.segments.length;
    const A = 360 / count;
    const theta = ((-e.rot % 360) + 360) % 360;
    const idx = Math.floor(theta / A) % count;
    const center = (idx + 0.5) * A;
    const off = Math.abs(theta - center) / (A / 2);
    const rating: "PERFECT" | "GREAT" | "GOOD" =
      off < 0.24 ? "PERFECT" : off < 0.6 ? "GREAT" : "GOOD";

    // align segment centre to the pointer
    const base = -center;
    let target = base;
    while (target - e.rot > 180) target -= 360;
    while (e.rot - target > 180) target += 360;

    e.from = e.rot;
    e.to = target;
    e.t = 0;
    e.dur = 0.4;
    e.mode = "settle";
    e.pending = { idx, rating };
    e.celebrated = false;
    e.shake = Math.min(16, 7 + off * 4);
    setLanded(idx);
    sfx.lock();
  }, []);

  const resolve = useCallback(() => {
    const e = eng.current;
    const r = roundRef.current;
    if (!e.pending) return;
    const { idx, rating } = e.pending;
    e.pending = null;
    const seg = r.segments[idx];
    const s = stateRef.current;

    let nextLives = s.lives;
    let nextScore = s.score;
    let nextCombo = s.combo;
    let nextCaught = s.caught;
    let nextLevel = s.level;
    let nextBest = bestMon;
    let didLevel = false;
    let didBall = false;

    if (seg.rocket) {
      nextLives -= 1;
      nextCombo = 0;
      setCombo(0);
      sfx.fail();
      e.shake = 22;
      failBurst("#ef4444");
      finishResolve({ kind: "rocket", seg }, nextLives, nextScore);
      return;
    }

    if (!matches(seg, r.objective)) {
      nextLives -= 1;
      nextCombo = 0;
      setCombo(0);
      sfx.flee();
      e.shake = 14;
      failBurst("#f97316");
      finishResolve({ kind: "flee", seg }, nextLives, nextScore);
      return;
    }

    // successful catch
    const base = RARITY[seg.mon.rarity].points;
    const shinyMult = seg.shiny ? 3 : 1;
    const ratingMult = rating === "PERFECT" ? 1.5 : rating === "GREAT" ? 1.2 : 1;
    const comboMult = Math.min(5, 1 + nextCombo * 0.25);
    const jackMult = r.jackpot ? 2 : 1;
    const timeBonus = Math.round(e.timeLeft * 18);
    const modeMult = MODES[r.mode]?.scoreMult ?? 1;
    const gained = Math.round(
      (base * shinyMult * ratingMult * comboMult * jackMult + timeBonus) * modeMult,
    );

    nextScore += gained;
    nextCombo += 1;
    nextCaught += 1;
    if (base * shinyMult > bestValRef.current) {
      bestValRef.current = base * shinyMult;
      nextBest = seg.mon;
    }

    // level every 5 catches
    if (nextCaught % 5 === 0) {
      nextLevel += 1;
      didLevel = true;
      if (nextLives < 5) {
        nextLives += 1;
        didBall = true;
      }
    }

    // state updates
    setScore(nextScore);
    setScoreKey((k) => k + 1);
    setCombo(nextCombo);
    setCaught(nextCaught);
    setLevel(nextLevel);
    setBestMon(nextBest);
    setLevelUp(didLevel);
    setBallGain(didBall);
    stateRef.current = {
      score: nextScore,
      lives: nextLives,
      combo: nextCombo,
      level: nextLevel,
      caught: nextCaught,
    };

    const legendary = seg.mon.rarity === "legendary";
    if (legendary) {
      sfx.legendary();
      e.shake = 26;
      e.flash = 0.85;
    } else if (rating === "PERFECT") {
      sfx.perfect();
      e.shake = 18;
      e.flash = 0.4;
    } else {
      sfx.catch(nextCombo);
      e.shake = 12;
      e.flash = seg.shiny ? 0.5 : 0.22;
    }
    celebrate(seg.mon, legendary || r.jackpot || seg.shiny);

    if (didLevel) window.setTimeout(() => sfx.levelUp(), 320);

    finishResolve({ kind: "catch", seg, rating, gained }, nextLives, nextScore);
  }, [celebrate, failBurst, finishResolve]);

  const onTimeout = useCallback(() => {
    const e = eng.current;
    if (e.mode !== "spin") return;
    e.mode = "idle";
    e.pending = null;
    const s = stateRef.current;
    const nextLives = s.lives - 1;
    setCombo(0);
    stateRef.current = { ...s, lives: nextLives, combo: 0 };
    sfx.fail();
    e.shake = 18;
    failBurst("#ef4444");
    finishResolve({ kind: "timeout" }, nextLives, s.score);
  }, [failBurst, finishResolve]);

  /* ---------------- main loop ---------------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let urgentLocal = false;
    let warnIdx = -1;
    let lastTickAt = 0;
    let lastLiveAt = 0;
    let e_liveIdx = -1;

    const updateLive = (idx: number, segs: typeof roundRef.current.segments) => {
      if (e_liveIdx === idx) return;
      e_liveIdx = idx;
      const s = segs[idx];
      if (!s) return;
      if (liveNameRef.current) liveNameRef.current.textContent = s.trainer;
      if (liveImgRef.current) {
        liveImgRef.current.style.visibility = s.rocket ? "hidden" : "visible";
        if (!s.rocket) liveImgRef.current.src = spriteUrl(s.mon.id, s.shiny);
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.0005, (now - last) / 1000));
      last = now;
      const e = eng.current;
      const ph = phaseRef.current;
      const r = roundRef.current;
      const count = r.segments.length;
      const A = 360 / count;

      if (ph === "paused") {
        // frozen
      } else if (ph === "menu" || ph === "gameover") {
        // gentle idle spin for eye candy
        e.rot += 22 * dt;
        e.labelOpacity = 1;
      } else if (e.mode === "spin") {
        e.roundT += dt;
        const ramp = Math.min(1, 0.28 + (e.roundT / 0.5) * 0.72);
        const vel = e.vel * ramp;
        e.rot += vel * e.dir * dt;
        const theta = ((-e.rot % 360) + 360) % 360;
        const idx = Math.floor(theta / A) % count;
        if (idx !== e.lastIdx) {
          e.lastIdx = idx;
          // crowded wheels fly through dozens of wedges per second — cap the
          // click rate so the audio doesn't turn into a buzz
          if (now - lastTickAt > (count > 26 ? 78 : 0)) {
            lastTickAt = now;
            if (ph === "playing") sfx.tick(vel);
          }
        }
        if (now - lastLiveAt > 70) {
          lastLiveAt = now;
          updateLive(idx, r.segments);
        }
        e.labelOpacity = Math.max(0.55, 1 - vel / 1400);

        if (ph === "playing") {
          e.timeLeft -= dt;
          if (e.timeLeft <= 3.05 && !urgentLocal) {
            urgentLocal = true;
            setUrgent(true);
          } else if (e.timeLeft > 3.2 && urgentLocal) {
            urgentLocal = false;
            setUrgent(false);
          }
          if (e.timeLeft <= 1.05) {
            const w = Math.ceil(e.timeLeft * 2);
            if (w !== warnIdx) {
              warnIdx = w;
              sfx.timeWarning();
            }
          } else if (e.timeLeft > 1.2) {
            warnIdx = -1;
          }
          if (e.timeLeft <= 0) {
            e.timeLeft = 0;
            onTimeout();
          }
        }

        // pointer trail
        if (vel > 120 && ph === "playing") {
          e.trailAcc += dt;
          if (e.trailAcc > 0.035) {
            e.trailAcc = 0;
            const { x, y } = wheelCenter();
            particles.trail(x, y - size * 0.02, Math.random() < 0.5 ? GOLD : "#ffffff");
          }
        }
      } else if (e.mode === "settle") {
        e.t += dt;
        const p = Math.min(1, e.t / e.dur);
        e.rot = e.from + (e.to - e.from) * easeOutBack(p);
        e.labelOpacity = Math.min(1, e.labelOpacity + dt * 3);
        updateLive(
          Math.floor((((-e.rot % 360) + 360) % 360) / A) % count,
          r.segments,
        );
        if (!e.celebrated && p > 0.62) {
          e.celebrated = true;
          if (e.pending) resolve();
        }
        if (p >= 1) {
          e.rot = e.to;
          e.mode = "idle";
        }
      } else {
        e.labelOpacity = Math.min(1, e.labelOpacity + dt * 3);
      }

      // ---- write DOM ----
      if (spinRef.current)
        spinRef.current.style.transform = `rotate(${e.rot.toFixed(2)}deg)`;
      if (labelRef.current)
        labelRef.current.style.opacity = e.labelOpacity.toFixed(2);

      const frac =
        ph === "playing" && e.timeTotal > 0
          ? Math.max(0, e.timeLeft / e.timeTotal)
          : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${frac.toFixed(3)})`;
      if (textRef.current)
        textRef.current.textContent = Math.max(0, e.timeLeft).toFixed(1);
      if (ringRef.current) {
        const c = 2 * Math.PI * ringRef.current.r.baseVal.value;
        ringRef.current.style.strokeDashoffset = (c * (1 - frac)).toFixed(1);
      }

      // shake
      if (e.shake > 0.05) {
        e.shake *= Math.pow(0.0025, dt);
        const m = e.shake;
        const sx = (Math.random() - 0.5) * m * 2;
        const sy = (Math.random() - 0.5) * m * 2;
        const sr = (Math.random() - 0.5) * m * 0.22;
        if (shakeRef.current)
          shakeRef.current.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(
            1,
          )}px,0) rotate(${sr.toFixed(2)}deg)`;
      } else if (e.shake !== 0) {
        e.shake = 0;
        if (shakeRef.current) shakeRef.current.style.transform = "";
      }

      // flash
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
  }, [onTimeout, particles, resolve, wheelCenter]);

  /* ---------------- input ---------------- */
  const primaryAction = useCallback(() => {
    initAudio();
    const ph = phaseRef.current;
    if (ph === "menu") {
      startGame();
    } else if (ph === "playing") {
      doStop();
    } else if (ph === "result") {
      advance();
    }
  }, [advance, doStop, startGame]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (ev.code === "Space" || ev.code === "Enter" || ev.key === " ") {
        ev.preventDefault();
        if (ev.repeat) return;
        if (showNamesRef.current) {
          setShowNames(false);
          return;
        }
        if (phaseRef.current === "paused") setPhase("playing");
        else if (phaseRef.current === "gameover") startGame();
        else primaryAction();
        return;
      }
      if (ev.key === "Escape" || ev.key === "p" || ev.key === "P") {
        if (showNamesRef.current) {
          setShowNames(false);
          return;
        }
        if (phaseRef.current === "playing") {
          setPhase("paused");
          sfx.ui();
        } else if (phaseRef.current === "paused") {
          setPhase("playing");
          sfx.ui();
        }
        return;
      }
      if (ev.key === "m" || ev.key === "M") {
        setMuted(toggleMute());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [primaryAction, startGame]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  /* ---------------- derived ---------------- */
  const R = size / 2;
  const ringR = R * 1.145;
  const circ = 2 * Math.PI * ringR;

  const handleStagePointer = (ev: React.PointerEvent) => {
    const t = ev.target as HTMLElement;
    if (t.closest("button, input, a, [data-no-tap]")) return;
    primaryAction();
  };

  const saveEntry = (name: string) => {
    const s = stateRef.current.score;
    const { list } = saveScore({
      name,
      score: s,
      level: stateRef.current.level,
      caught: stateRef.current.caught,
      best: bestMon?.name ?? "—",
      date: Date.now(),
    });
    setEntries(list);
    setBest(list.length ? list[0].score : 0);
  };

  const objective: Objective = round.objective;
  const count = round.segments.length;
  const dense = count > 26;

  return (
    <div className="arena-bg fixed inset-0 overflow-hidden">
      <BrandBackdrop />
      {/* shaken stage */}
      <div
        ref={shakeRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <div
          ref={stageRef}
          className="absolute inset-0 flex flex-col"
          onPointerDown={handleStagePointer}
        >
          <TopBar
            score={score}
            best={Math.max(best, score)}
            combo={combo}
            level={level}
            lives={lives}
            muted={muted}
            modeLabel={MODES[round.mode].label}
            modeNames={MODES[round.mode].names}
            scoreKey={scoreKey}
            onPause={() => {
              if (phaseRef.current === "playing") {
                setPhase("paused");
                sfx.ui();
              }
            }}
            onMute={() => setMuted(toggleMute())}
          />

          <main
            className={`flex flex-1 flex-col items-center justify-center gap-2 px-3 pt-12 sm:pt-14 ${
              count > 14 ? "lg:pr-[236px]" : ""
            }`}
          >
            <div className="relative">
              <Wheel
                segments={round.segments}
                size={size}
                spinRef={spinRef}
                labelRef={labelRef}
                objective={objective}
                landed={landed}
                showTargets={phase === "playing" || phase === "paused"}
              />
              {/* timer ring */}
              <svg
                className="pointer-events-none absolute z-10 overflow-visible"
                style={{
                  left: -size * 0.17,
                  top: -size * 0.17,
                  width: size * 1.34,
                  height: size * 1.34,
                }}
                viewBox={`${-R * 1.34} ${-R * 1.34} ${size * 1.34} ${size * 1.34}`}
              >
                <defs>
                  <linearGradient id="tr-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                  <linearGradient id="tr-r" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <g
                  style={{
                    opacity: phase === "playing" ? 1 : 0,
                    transition: "opacity .2s ease",
                  }}
                >
                  <circle
                    r={ringR}
                    fill="none"
                    stroke="rgba(255,255,255,.12)"
                    strokeWidth={Math.max(4, size * 0.016)}
                  />
                  <circle
                    ref={ringRef}
                    r={ringR}
                    fill="none"
                    stroke={urgent ? "url(#tr-r)" : "url(#tr-g)"}
                    strokeWidth={Math.max(4, size * 0.016)}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={0}
                    transform="rotate(-90)"
                  />
                </g>
              </svg>
            </div>

            <div className="flex w-full flex-col items-center gap-2 pb-1">
              <ObjectiveBanner objective={objective} jackpot={round.jackpot} />
              <TimerBar barRef={barRef} textRef={textRef} urgent={urgent} />
              <div className="flex flex-wrap items-center justify-center gap-2 [@media(orientation:landscape)_and_(max-height:520px)]:hidden">
                {dense && (
                  <div className="flex h-8 items-center gap-2 rounded-2xl border-2 border-sky-300/40 bg-black/45 px-2.5 backdrop-blur-sm">
                    <span className="text-[8px] font-black uppercase leading-none tracking-[0.18em] text-sky-200/70">
                      Pointer
                    </span>
                    <img
                      ref={liveImgRef}
                      alt=""
                      width={24}
                      height={24}
                      className="pixel h-6 w-6 object-contain"
                    />
                    <span
                      ref={liveNameRef}
                      className="font-logo text-sm leading-none text-white"
                    >
                      —
                    </span>
                  </div>
                )}
                {count > 14 && (
                  <button
                    onClick={() => {
                      sfx.ui();
                      if (phaseRef.current === "playing") setPhase("paused");
                      setShowNames(true);
                    }}
                    className="btn-poke flex h-8 items-center gap-1.5 rounded-2xl border-2 border-white/25 bg-black/45 px-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm lg:hidden"
                  >
                    📋 {count} names
                  </button>
                )}
                {!dense && (
                  <div className="text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                    {phase === "playing"
                      ? size < 300
                        ? "Tap to stop"
                        : "Press Space / Tap to stop the wheel"
                      : "\u00a0"}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* danger vignette */}
      {urgent && phase === "playing" && (
        <div className="anim-danger pointer-events-none absolute inset-0 z-20" />
      )}

      {/* flash */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 z-30 bg-white"
        style={{ opacity: 0 }}
      />

      {/* particles */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-40"
      />

      {/* desktop name panel for crowded wheels */}
      {count > 14 && (phase === "playing" || phase === "result" || phase === "paused") && (
        <div className="absolute bottom-2 right-2 top-24 z-20 hidden w-[228px] flex-col gap-1.5 lg:flex">
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-white/15 bg-black/45 px-2 py-1 backdrop-blur-sm">
            <span className="font-logo text-xs text-poke-yellow">
              {MODES[round.mode].label}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/45">
              {count} names
            </span>
            <span className="ml-auto text-[10px]">🎯 target</span>
          </div>
          <NameList
            segments={round.segments}
            objective={objective}
            landed={landed}
            liveIdx={-1}
          />
        </div>
      )}

      {/* mobile / tablet name overlay */}
      {showNames && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#050814]/92 p-3 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-logo text-lg text-poke-yellow">
              {count} NAMES
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/45">
              {MODES[round.mode].label}
            </span>
            <button
              onClick={() => {
                sfx.ui();
                setShowNames(false);
              }}
              className="btn-poke ml-auto grid h-9 w-9 place-items-center rounded-xl border-2 border-white/25 bg-white/10 text-lg font-black text-white"
              aria-label="Close name list"
            >
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <NameList
              segments={round.segments}
              objective={objective}
              landed={landed}
              liveIdx={-1}
            />
          </div>
        </div>
      )}

      {/* back to the giveaway picker */}
      <button
        onClick={() => {
          sfx.ui();
          onExit();
        }}
        className="btn-poke absolute left-2 top-2 z-50 rounded-xl border-2 border-sky-300/50 bg-gradient-to-b from-sky-400/40 to-blue-700/50 px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm"
      >
        ← 🎁 Giveaway
      </button>

      {/* overlays */}
      {phase === "menu" && (
        <StartScreen
          best={best}
          entries={entries}
          mode={mode}
          onMode={(m) => {
            sfx.ui();
            setMode(m);
            setRound(buildRound(1, m));
          }}
          onPlay={startGame}
        />
      )}
      {phase === "paused" && (
        <PauseScreen
          entries={entries}
          onResume={() => setPhase("playing")}
          onRestart={startGame}
          onQuit={goMenu}
        />
      )}
      {phase === "gameover" && (
        <GameOverScreen
          score={score}
          level={level}
          caught={caught}
          bestMon={bestMon}
          isRecord={isRecord}
          entries={entries}
          onRestart={startGame}
          onMenu={goMenu}
          onSave={saveEntry}
        />
      )}
      {phase === "result" && outcome && (
        <ResultCard
          outcome={outcome}
          levelUp={levelUp}
          ballGain={ballGain}
          onSkip={advance}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App shell — the giveaway picker is the main event, the arcade      */
/*  mini-game lives behind a button.                                   */
/* ------------------------------------------------------------------ */

export default function App() {
  const [view, setView] = useState<"picker" | "game">("picker");

  useEffect(() => {
    const unlock = () => initAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return view === "picker" ? (
    <PickerScreen onArcade={() => setView("game")} />
  ) : (
    <GameScreen onExit={() => setView("picker")} />
  );
}
