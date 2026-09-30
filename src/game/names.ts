import { MONS, TYPE_COLORS, type Mon } from "./data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Entry {
  id: string;
  name: string;
  weight: number;
  mon: Mon;
  color: string;
  color2: string;
}

export interface Winner {
  id: string;
  name: string;
  monId: number;
  monName: string;
  at: number;
  drawId: string;
  ordinal: number;
}

export interface ParseResult {
  entries: Entry[];
  duplicates: number;
  skipped: number;
}

/* ------------------------------------------------------------------ */
/*  Random — cryptographically secure, so a draw is provably fair      */
/* ------------------------------------------------------------------ */

export function secureFloat(): number {
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] / 4294967296;
    }
  } catch {
    /* ignore */
  }
  return Math.random();
}

export function secureHex(len: number): string {
  let out = "";
  while (out.length < len) {
    out += Math.floor(secureFloat() * 0x10)
      .toString(16)
      .toUpperCase();
  }
  return out.slice(0, len);
}

export function makeDrawId(): string {
  return `DGH-${secureHex(4)}-${secureHex(3)}`;
}

export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Stable Pokémon per name — the same person always gets the same partner. */
export function monFor(name: string): Mon {
  return MONS[hash32(name.toLowerCase().trim()) % MONS.length];
}

/* ------------------------------------------------------------------ */
/*  Colours                                                            */
/* ------------------------------------------------------------------ */

function mix(c1: string, c2: string, t: number) {
  const p = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const a = p(c1);
  const b = p(c2);
  const r = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${r.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function makeEntry(name: string, weight: number): Entry {
  const mon = monFor(name);
  const a = TYPE_COLORS[mon.types[0]] ?? "#A8A77A";
  const b = TYPE_COLORS[mon.types[1] ?? mon.types[0]] ?? a;
  return {
    id: `${name.toLowerCase().trim()}#${hash32(name.toLowerCase().trim()).toString(36)}`,
    name,
    weight: Math.max(1, Math.min(999, Math.round(weight))),
    mon,
    color: mix(a, "#ffffff", 0.14),
    color2: mix(b, "#ffffff", 0.06),
  };
}

/* ------------------------------------------------------------------ */
/*  Paste cleaning — built for Facebook comment / subscriber lists     */
/* ------------------------------------------------------------------ */

const NOISE: RegExp[] = [
  /^\s*(reply|like|share|follow|comment|hide|report|view|replies|likes)\b/i,
  /^\s*\d+\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes|d|day|days|w|wk|week|weeks|y|yr|yrs)\b\.?\s*$/i,
  /^https?:\/\//i,
  /^\s*[\p{Extended_Pictographic}\s\d.,·•—–\-|()]+$/u,
  /^\s*(top\s+fan|fan|new\s+member|member|moderator|admin|contributor)\s*$/i,
];

/** Strip Facebook UI junk from a copied line: "@Name · Reply · Like · 2h" */
export function cleanLine(raw: string): string {
  let s = raw.replace(/\u200e|\u200f|\ufeff/g, "").trim();
  // drop everything from a FB action verb onwards ("· Reply · 12")
  s = s.split(/\s[·•]\s*(?:Reply|Like|Share|Hide|Report|Follow|View)\b/i)[0];
  // drop a trailing relative timestamp ("· 2h", "· 3 d", "2 w")
  s = s.replace(/\s*[·•]\s*\d+\s*(h|hr|hrs|m|min|mins|d|day|days|w|wk|week|weeks)\b.*$/i, "");
  // leading list numbers: "1." "12)" "3 -"
  s = s.replace(/^\s*\d{1,3}\s*[.)\-–:]\s+/, "");
  // leading @ / bullet
  s = s.replace(/^[@•·\-–]+\s*/, "");
  // stray quotes
  s = s.replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, "");
  // collapse whitespace
  return s.replace(/\s+/g, " ").trim();
}

export function isNoise(s: string): boolean {
  if (!s) return true;
  if (s.length > 48) return false;
  return NOISE.some((r) => r.test(s));
}

const SPLIT = /[\n\r\t;]+|,(?=\s*[^\s])|,(?=\s*$)/;

/** Weight syntax: "Name x3", "Name *3", "Name × 3", "Name (3)" */
const WEIGHT_TAIL = [
  /\s*[x×*]\s*(\d{1,3})\s*$/i,
  /\s*\(\s*(\d{1,3})\s*\)\s*$/,
];

function extractWeight(line: string): { name: string; weight: number } {
  for (const re of WEIGHT_TAIL) {
    const m = line.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > 0) return { name: line.replace(re, "").trim(), weight: n };
    }
  }
  return { name: line, weight: 1 };
}

export function splitNames(text: string): string[] {
  return text
    .split(SPLIT)
    .map((l) => cleanLine(l))
    .filter((l) => !isNoise(l));
}

export function parseNames(
  text: string,
  opts: { countDuplicates: boolean },
): ParseResult {
  const map = new Map<string, { name: string; weight: number; seen: number }>();
  let skipped = 0;
  let raw = 0;

  for (const line of text.split(SPLIT)) {
    const cleaned = cleanLine(line);
    raw++;
    if (isNoise(cleaned)) {
      if (cleaned.length > 0) skipped++;
      continue;
    }
    const { name, weight } = extractWeight(cleaned);
    if (!name) {
      skipped++;
      continue;
    }
    const key = name.toLowerCase();
    const prev = map.get(key);
    if (prev) {
      prev.seen++;
      prev.weight += weight;
      if (name.length < prev.name.length) prev.name = name;
    } else {
      map.set(key, { name, weight, seen: 1 });
    }
  }

  let duplicates = 0;
  const entries: Entry[] = [];
  for (const v of map.values()) {
    let w = v.weight;
    if (opts.countDuplicates) {
      duplicates += v.seen - 1;
    } else {
      // duplicates collapse to their explicit multiplier only
      w = Math.max(1, w - (v.seen - 1));
    }
    entries.push(makeEntry(v.name, w));
  }

  void raw;
  return { entries, duplicates, skipped };
}

export function totalWeight(entries: Entry[]): number {
  return entries.reduce((a, e) => a + e.weight, 0);
}

/** Weighted pick using crypto randomness. Returns the index of the winner. */
export function weightedPick(entries: Entry[]): number {
  const total = totalWeight(entries);
  if (total <= 0) return 0;
  const r = secureFloat() * total;
  let acc = 0;
  for (let i = 0; i < entries.length; i++) {
    acc += entries[i].weight;
    if (r < acc) return i;
  }
  return entries.length - 1;
}

export function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(secureFloat() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/*  Export helpers                                                     */
/* ------------------------------------------------------------------ */

function stamp(at: number): string {
  return new Date(at).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function winnerToPost(w: Winner, total: number): string {
  return [
    "🎉 GIVEAWAY WINNER 🎉",
    "",
    `🏆 ${w.name}`,
    `Pokémon: ${w.monName}`,
    "",
    `Draw ID: ${w.drawId}`,
    `Drawn: ${stamp(w.at)}`,
    `Selected at random from ${total} entries`,
    `✋✨ Dan Gold Hands | דן ידי זהב`,
  ].join("\n");
}

export function winnersToPost(winners: Winner[], total: number): string {
  if (winners.length === 0) return "";
  const lines = ["🎊 GIVEAWAY WINNERS 🎊", ""];
  winners.forEach((w, i) => {
    lines.push(`${i + 1}. ${w.name} — ${w.monName}`);
  });
  lines.push("", `Drawn at random from ${total} entries.`);
  lines.push("Thank you to everyone who entered! 🙏");
  lines.push(`Draw IDs: ${winners.map((w) => w.drawId).join(", ")}`);
  lines.push("", "✋✨ Dan Gold Hands | דן ידי זהב");
  return lines.join("\n");
}

export function winnersToCsv(winners: Winner[]): string {
  const rows = [["place", "name", "pokemon", "draw_id", "drawn_at"]];
  winners.forEach((w, i) => {
    rows.push([
      String(i + 1),
      w.name,
      w.monName,
      w.drawId,
      new Date(w.at).toISOString(),
    ]);
  });
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Sample data (Facebook-flavoured, includes junk + weights)          */
/* ------------------------------------------------------------------ */

export const SAMPLE_TEXT = `Ash Ketchum
Misty Waters
@Brock Stone · Reply · Like · 2h
1. Gary Oak
Prof. Oak x3
Jessie Musashi
James Yamada
Nurse Joy
Reply · Like · 3h
Officer Jenny
Erika Floral
Sabrina Psychic
Koga Ninja
Giovanni Rossi x2
Lorelei Ice
Bruno Fighter
Agatha Ghost
Lance Dragon
Red Trainer
Blue Rival
Leaf Green
Ethan Johto
Kris Crystal
Lyra Newbark
May Maple
Brendan Birch
Dawn Berlitz
Lucas Diamond
Hilbert Unova
Hilda Unova
Nate Unova
Rosa Unova
Serena Kalos
Calem Kalos
Gladion Aether
Lillie Aether
Kukui Alola
Leon Galar x2
Hop Galar
Marnie Spikemuth
Bede Galar
Nessa Hulbury
Milo Turffield
Raihan Hammerlocke
Bea Stowside
Allister Galar
Cynthia Sinnoh
Steven Hoenn
Wallace Sootopolis
Iris Unova
Alder Unova
Diantha Kalos
N Harmonia
Sophocles Alola
Lana Alola
Kiawe Alola
Mallow Alola
Ilima Alola
Riley Sinnoh
Casey Johto
Jordan Kanto
Sam Paldea
Alex Paldea
Rowan Sinnoh
Sky Violet
Nova Cerulean
Kai Cinnabar
Emz Fuchsia
Bex Viridian
Theo Pewter
https://facebook.com/example
Like · Reply · 1d`;

/* ------------------------------------------------------------------ */
/*  Local storage                                                      */
/* ------------------------------------------------------------------ */

const K = {
  text: "poketrip.picker.text",
  settings: "poketrip.picker.settings",
  winners: "poketrip.picker.winners",
  removed: "poketrip.picker.removed",
};

export interface PickerSettings {
  countDuplicates: boolean;
  showPokemon: boolean;
  removeWinners: boolean;
  drawCount: number;
}

export const DEFAULT_SETTINGS: PickerSettings = {
  countDuplicates: false,
  showPokemon: true,
  removeWinners: true,
  drawCount: 1,
};

export function loadPickerState(): {
  text: string;
  settings: PickerSettings;
  winners: Winner[];
  removed: string[];
} {
  let text = "";
  let settings = DEFAULT_SETTINGS;
  let winners: Winner[] = [];
  let removed: string[] = [];
  try {
    text = localStorage.getItem(K.text) ?? "";
    const s = localStorage.getItem(K.settings);
    if (s) settings = { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
    const w = localStorage.getItem(K.winners);
    if (w) {
      const parsed = JSON.parse(w);
      if (Array.isArray(parsed)) winners = parsed.slice(0, 2000);
    }
    const r = localStorage.getItem(K.removed);
    if (r) {
      const parsed = JSON.parse(r);
      if (Array.isArray(parsed)) removed = parsed.slice(0, 5000);
    }
  } catch {
    /* ignore */
  }
  if (!text.trim()) text = SAMPLE_TEXT;
  return { text, settings, winners, removed };
}

export function savePickerState(p: {
  text: string;
  settings: PickerSettings;
  winners: Winner[];
  removed: string[];
}) {
  try {
    localStorage.setItem(K.text, p.text);
    localStorage.setItem(K.settings, JSON.stringify(p.settings));
    localStorage.setItem(K.winners, JSON.stringify(p.winners.slice(0, 2000)));
    localStorage.setItem(K.removed, JSON.stringify(p.removed.slice(0, 5000)));
  } catch {
    /* ignore */
  }
}
