export interface ScoreEntry {
  name: string;
  score: number;
  level: number;
  caught: number;
  best: string;
  date: number;
}

const KEY = "poketrip.scores.v1";

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e.score === "number")
      .slice(0, 10)
      .sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score);
  } catch {
    return [];
  }
}

export function saveScore(entry: ScoreEntry): { list: ScoreEntry[]; rank: number } {
  const list = loadScores();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, 10);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
  const rank = trimmed.findIndex((e) => e === entry);
  return { list: trimmed, rank };
}

export function bestScore(): number {
  const l = loadScores();
  return l.length ? l[0].score : 0;
}

const NAMES = ["ASH", "MISTY", "BROCK", "GARY", "RED", "CYNTHIA", "LEON", "LANCE"];

export function randomTrainer() {
  return NAMES[Math.floor(Math.random() * NAMES.length)];
}
