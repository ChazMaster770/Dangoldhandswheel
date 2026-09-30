import { useState } from "react";
import { RARITY } from "../game/data";
import {
  copyText,
  winnerToPost,
  winnersToCsv,
  winnersToPost,
  downloadFile,
  type Entry,
  type Winner,
} from "../game/names";
import { LogoBadge, MonSprite } from "./Bits";

export function WinnerCard({
  entry,
  winner,
  total,
  ordinal,
  ofCount,
  queue,
  onClose,
  onAgain,
}: {
  entry: Entry;
  winner: Winner;
  total: number;
  ordinal: number;
  ofCount: number;
  queue: number;
  onClose: () => void;
  onAgain: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const legendary = entry.mon.rarity === "legendary";

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050814]/80 p-4 backdrop-blur-sm">
      <div
        className="anim-pop relative w-full max-w-sm overflow-hidden rounded-3xl border-4 border-amber-300 bg-gradient-to-b from-[#1b2a6b]/97 to-[#0b1020]/97 p-4 text-center shadow-[0_24px_70px_rgba(0,0,0,.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-48 opacity-70 blur-2xl"
          style={{
            background: "radial-gradient(50% 100% at 50% 100%, #ffd93b, transparent)",
          }}
        />
        <div className="relative">
          <div className="mb-1 flex items-center justify-center gap-2">
            <LogoBadge size={34} />
            <span className="font-logo text-xs tracking-wide text-amber-200/80">
              DAN GOLD HANDS
            </span>
          </div>
          <div className="font-logo text-sm tracking-wide text-white/70">
            {ofCount > 1 ? `WINNER ${ordinal} OF ${ofCount}` : "WE HAVE A WINNER"}
          </div>

          <div className="anim-float mx-auto mt-1 w-fit">
            <div className="relative">
              <MonSprite mon={entry.mon} size={104} />
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                style={{
                  background: RARITY[entry.mon.rarity].color,
                  color: "#0b1020",
                }}
              >
                {RARITY[entry.mon.rarity].label}
              </span>
            </div>
          </div>

          <div
            className="anim-pop mt-3 break-words font-logo text-[clamp(1.5rem,8vw,2.4rem)] leading-tight text-poke-yellow"
            style={{ textShadow: "0 3px 0 #2a3b9c" }}
          >
            {entry.name}
          </div>

          <div className="mt-1 text-[11px] font-black uppercase tracking-widest text-white/45">
            {entry.mon.name} · {entry.weight > 1 ? `${entry.weight} chances` : "1 chance"} of{" "}
            {total.toLocaleString()}
          </div>

          <div className="mt-2.5 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-xl border-2 border-white/15 bg-black/40 px-2.5 py-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
              Draw ID
            </span>
            <span className="font-mono text-xs font-black text-emerald-300">
              {winner.drawId}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[10px] font-bold text-white/45">
              {new Date(winner.at).toLocaleTimeString()}
            </span>
          </div>

          {legendary && (
            <div className="mt-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-950">
              ★ Legendary pull ★
            </div>
          )}

          <div className="mt-3 flex flex-col gap-1.5">
            <button
              onClick={async () => {
                const ok = await copyText(winnerToPost(winner, total));
                if (ok) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }
              }}
              className="btn-poke rounded-2xl border-4 border-amber-200 bg-gradient-to-b from-amber-300 to-orange-500 px-4 py-2.5 font-logo text-base text-amber-950 shadow-[0_5px_0_#a3530a]"
            >
              {copied ? "✅ COPIED!" : "📋 COPY FOR FACEBOOK"}
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={onAgain}
                className="btn-poke flex-1 rounded-2xl border-2 border-white/25 bg-white/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white"
              >
                ↻ Draw again
              </button>
              <button
                onClick={onClose}
                className="btn-poke flex-1 rounded-2xl border-2 border-white/25 bg-white/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white"
              >
                {queue > 0 ? `➜ Next (${queue} left)` : "✓ Done"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
            Press Space to continue
          </p>
        </div>
      </div>
    </div>
  );
}

export function WinnersPanel({
  winners,
  total,
  onUndo,
  onClear,
}: {
  winners: Winner[];
  total: number;
  onUndo: () => void;
  onClear: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  if (winners.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 px-3 py-8 text-center">
        <div className="text-3xl">🏆</div>
        <p className="font-logo text-lg text-white">NO WINNERS YET</p>
        <p className="text-[11px] font-bold text-white/45">
          Hit SPIN to draw your first winner. Every draw is saved here with its Draw ID.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={async () => {
            const ok = await copyText(winnersToPost(winners, total));
            if (ok) {
              setCopied("txt");
              setTimeout(() => setCopied(null), 1500);
            }
          }}
          className="btn-poke rounded-xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-300 to-green-600 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-950"
        >
          {copied === "txt" ? "✅ Copied" : "📋 Copy winners"}
        </button>
        <button
          onClick={() =>
            downloadFile(
              `dan-gold-hands-winners-${new Date().toISOString().slice(0, 10)}.csv`,
              winnersToCsv(winners),
            )
          }
          className="btn-poke rounded-xl border-2 border-white/20 bg-white/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white"
        >
          ⬇ Download CSV
        </button>
        <button
          onClick={onUndo}
          className="btn-poke rounded-xl border-2 border-white/20 bg-white/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white/70"
        >
          ↩ Undo last
        </button>
        <button
          onClick={onClear}
          className="btn-poke rounded-xl border-2 border-rose-300/50 bg-rose-500/25 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-rose-100"
        >
          🗑 Clear all
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto rounded-2xl border-2 border-white/12 bg-black/25 p-1.5">
        <ol className="space-y-[3px]">
          {winners.slice(-200).map((w, i, vis) => {
            const idx = winners.length - vis.length + i;
            return (
            <li
              key={`${w.id}-${idx}`}
              className={`flex items-center gap-1.5 rounded-lg px-1.5 py-[3px] ${
                idx === winners.length - 1
                  ? "bg-amber-400/25 ring-1 ring-amber-300/60"
                  : idx % 2
                    ? "bg-white/[0.05]"
                    : "bg-white/[0.02]"
              }`}
            >
              <span className="w-5 shrink-0 text-center text-[9px] font-black tabular-nums text-white/35">
                #{w.ordinal}
              </span>
              <MonSprite
                mon={{ id: w.monId, name: w.monName, types: ["normal"], rarity: "common" }}
                size={20}
              />
              <span className="min-w-0 flex-1 truncate text-[11px] font-black uppercase leading-tight text-white/90">
                {w.name}
              </span>
              <span className="shrink-0 font-mono text-[8px] font-bold text-emerald-300/70">
                {w.drawId}
              </span>
            </li>
            );
          })}
        </ol>
        {winners.length > 200 && (
          <p className="px-1.5 pb-1 pt-1.5 text-center text-[9px] font-black uppercase tracking-wider text-white/45">
            Showing the last 200 · all {winners.length.toLocaleString()} are in the CSV / copy
          </p>
        )}
      </div>
    </div>
  );
}
