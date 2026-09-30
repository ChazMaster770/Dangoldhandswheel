import { useEffect, useMemo, useState } from "react";
import {
  SAMPLE_TEXT,
  copyText,
  totalWeight,
  type Entry,
  type PickerSettings,
} from "../game/names";
import { MonSprite } from "./Bits";

function Toggle({
  on,
  onChange,
  label,
  hint,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex w-full items-start gap-2 rounded-xl border-2 border-white/12 bg-white/[0.04] px-2.5 py-2 text-left transition hover:bg-white/[0.08]"
    >
      <span
        className={`mt-0.5 grid h-5 w-9 shrink-0 place-items-center rounded-full transition ${
          on ? "bg-gradient-to-r from-emerald-300 to-green-500" : "bg-white/15"
        }`}
      >
        <span
          className={`block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-2" : "-translate-x-2"
          }`}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-wide text-white">
          {label}
        </span>
        <span className="block text-[10px] font-bold leading-tight text-white/45">{hint}</span>
      </span>
    </button>
  );
}

export function EntriesPanel({
  text,
  entries,
  removed,
  settings,
  setSettings,
  onApply,
  onShuffle,
  onSort,
  onRemoveName,
  onClearWinners,
  winnerCount,
}: {
  text: string;
  entries: Entry[];
  removed: string[];
  settings: PickerSettings;
  setSettings: (s: PickerSettings) => void;
  onApply: (t: string) => void;
  onShuffle: () => void;
  onSort: () => void;
  onRemoveName: (e: Entry) => void;
  onClearWinners: () => void;
  winnerCount: number;
}) {
  const [draft, setDraft] = useState(text);
  const [showPaste, setShowPaste] = useState(entries.length === 0);
  const [copied, setCopied] = useState(false);

  // keep the editor in step when the list is changed by shuffle / sort / clear
  useEffect(() => setDraft(text), [text]);

  const chances = useMemo(() => totalWeight(entries), [entries]);
  void draft;

  const apply = (value?: string) => {
    const v = value ?? draft;
    onApply(v);
    if (value !== undefined) setDraft(value);
    setShowPaste(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* summary */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { k: "Names", v: entries.length },
          { k: "Chances", v: chances },
          { k: "Drawn", v: winnerCount },
        ].map((s) => (
          <div
            key={s.k}
            className="rounded-xl border-2 border-white/15 bg-black/35 px-2 py-1.5 text-center"
          >
            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-white/45">
              {s.k}
            </div>
            <div className="font-logo text-lg leading-none text-poke-yellow">
              {s.v.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && !showPaste && (
        <div className="rounded-2xl border-2 border-dashed border-white/20 px-3 py-5 text-center">
          <div className="text-3xl">📋</div>
          <p className="mt-1 font-logo text-lg text-white">NO NAMES YET</p>
          <p className="mb-2 text-[11px] font-bold text-white/50">
            Paste your Facebook commenters or subscribers to build the wheel.
          </p>
          <button
            onClick={() => setShowPaste(true)}
            className="btn-poke rounded-xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-300 to-green-600 px-3 py-2 font-logo text-xs text-emerald-950"
          >
            ➕ ADD NAMES
          </button>
        </div>
      )}

      {showPaste && (
        <div className="anim-slide rounded-2xl border-2 border-white/15 bg-black/40 p-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            rows={7}
            placeholder={"One name per line — as many as you need…\n\nAsh Ketchum\nMisty x3\nGary Oak"}
            className="no-scrollbar w-full resize-y rounded-xl border-2 border-white/15 bg-black/50 p-2 text-[12px] font-bold leading-snug text-white outline-none placeholder:text-white/25 focus:border-poke-yellow"
          />
          <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-wider text-white/45">
            <span className="min-w-0 truncate">
              No limit — 100, 500 or 5,000 names all work
            </span>
            <span className="shrink-0 tabular-nums text-amber-200/80">
              {draft.split(/\r?\n/).filter((l) => l.trim()).length.toLocaleString()} lines
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              onClick={() => apply()}
              className="btn-poke flex-1 rounded-xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-300 to-green-600 px-2 py-2 font-logo text-xs text-emerald-950"
            >
              ✔ APPLY
            </button>
            <button
              onClick={() => {
                setDraft(SAMPLE_TEXT);
                apply(SAMPLE_TEXT);
              }}
              className="btn-poke rounded-xl border-2 border-white/25 bg-white/10 px-2.5 py-2 text-[10px] font-black uppercase text-white"
            >
              Sample
            </button>
            <button
              onClick={() => {
                setDraft("");
                apply("");
              }}
              className="btn-poke rounded-xl border-2 border-rose-300/50 bg-rose-500/25 px-2.5 py-2 text-[10px] font-black uppercase text-rose-100"
            >
              Clear
            </button>
            {entries.length > 0 && (
              <button
                onClick={() => {
                  setDraft(text);
                  setShowPaste(false);
                }}
                className="btn-poke rounded-xl border-2 border-white/25 bg-white/10 px-2.5 py-2 text-[10px] font-black uppercase text-white/70"
              >
                Cancel
              </button>
            )}
          </div>
          <p className="mt-1.5 text-[9px] font-bold leading-tight text-white/40">
            Paste straight from Facebook — I strip “Reply · Like · 2h”, @, links and
            emoji-only lines. Use <b>Name x3</b> to give extra chances.
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <>
          {/* quick actions */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                setShowPaste((v) => !v);
              }}
              className="btn-poke rounded-xl border-2 border-sky-300/50 bg-gradient-to-b from-sky-400/30 to-blue-700/40 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white"
            >
              ✏️ Edit names
            </button>
            <button
              onClick={onShuffle}
              className="btn-poke rounded-xl border-2 border-white/20 bg-white/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white"
            >
              🔀 Shuffle order
            </button>
            <button
              onClick={onSort}
              className="btn-poke rounded-xl border-2 border-white/20 bg-white/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white"
            >
              🔤 Sort A–Z
            </button>
            <button
              onClick={async () => {
                const ok = await copyText(
                  entries.map((e) => e.name + (e.weight > 1 ? ` x${e.weight}` : "")).join("\n"),
                );
                if (ok) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1400);
                }
              }}
              className="btn-poke rounded-xl border-2 border-white/20 bg-white/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-white"
            >
              {copied ? "✅ Copied" : "📄 Copy list"}
            </button>
          </div>

          {/* entry chips */}
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto rounded-2xl border-2 border-white/12 bg-black/25 p-1.5">
            <ol className="space-y-[3px]">
              {entries.map((e, i) => {
                const isRemoved = removed.includes(e.id);
                return (
                  <li
                    key={e.id}
                    className={`flex items-center gap-1.5 rounded-lg px-1.5 py-[3px] ${
                      isRemoved ? "bg-rose-500/15" : i % 2 ? "bg-white/[0.05]" : "bg-white/[0.02]"
                    }`}
                  >
                    <span className="w-4 shrink-0 text-center text-[9px] font-black tabular-nums text-white/30">
                      {i + 1}
                    </span>
                    {settings.showPokemon ? (
                      <MonSprite
                        mon={e.mon}
                        size={20}
                        className={isRemoved ? "opacity-30 grayscale" : ""}
                      />
                    ) : (
                      <span
                        className="h-5 w-5 shrink-0 rounded-full"
                        style={{ background: e.color }}
                      />
                    )}
                    <span
                      className={`min-w-0 flex-1 truncate text-[11px] font-black uppercase leading-tight tracking-tight ${
                        isRemoved ? "text-white/35 line-through" : "text-white/90"
                      }`}
                    >
                      {e.name}
                    </span>
                    {e.weight > 1 && (
                      <span className="shrink-0 rounded-full bg-amber-400/90 px-1.5 text-[9px] font-black text-amber-950">
                        ×{e.weight}
                      </span>
                    )}
                    {!isRemoved && (
                      <button
                        onClick={() => onRemoveName(e)}
                        title="Remove from wheel"
                        className="shrink-0 rounded-md px-1 text-[11px] font-black text-white/25 transition hover:bg-rose-500/25 hover:text-rose-200"
                      >
                        ✕
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {winnerCount > 0 && (
            <button
              onClick={onClearWinners}
              className="btn-poke rounded-xl border-2 border-white/15 bg-white/[0.06] px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/60"
            >
              ♻️ Reset draw history ({winnerCount})
            </button>
          )}
        </>
      )}

      {/* settings */}
      <div className="space-y-1.5">
        <Toggle
          on={settings.removeWinners}
          onChange={(v) => setSettings({ ...settings, removeWinners: v })}
          label="Remove winner after draw"
          hint="Nobody can win twice — perfect for multi-prize draws"
        />
        <Toggle
          on={settings.countDuplicates}
          onChange={(v) => setSettings({ ...settings, countDuplicates: v })}
          label="Duplicates = extra chances"
          hint="A name pasted 3 times gets 3 tickets"
        />
        <Toggle
          on={settings.showPokemon}
          onChange={(v) => setSettings({ ...settings, showPokemon: v })}
          label="Show Pokémon on wheel"
          hint="Turn off for plain coloured wedges"
        />
      </div>

      <div className="rounded-xl border-2 border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-200">
          🔒 Provably fair draw
        </div>
        <p className="text-[9px] font-bold leading-tight text-emerald-100/60">
          Winners are chosen with <b>crypto.getRandomValues</b> before the wheel spins —
          the animation is just the reveal. Every draw gets a public Draw ID.
        </p>
      </div>
    </div>
  );
}
