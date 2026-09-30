export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface Mon {
  id: number;
  name: string;
  types: string[];
  rarity: Rarity;
}

export interface Segment {
  key: string;
  mon: Mon;
  trainer: string;
  shiny: boolean;
  rocket: boolean;
  color: string;
  color2: string;
}

export type Objective =
  | { kind: "type"; type: string }
  | { kind: "mon"; mon: Mon }
  | { kind: "shiny" }
  | { kind: "rarity"; rarity: Rarity }
  | { kind: "legendary" };

export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export const TYPE_EMOJI: Record<string, string> = {
  normal: "⭐",
  fire: "🔥",
  water: "💧",
  electric: "⚡",
  grass: "🍃",
  ice: "❄️",
  fighting: "🥊",
  poison: "☠️",
  ground: "⛰️",
  flying: "🌪️",
  psychic: "🔮",
  bug: "🐛",
  rock: "🪨",
  ghost: "👻",
  dragon: "🐉",
  dark: "🌙",
  steel: "⚙️",
  fairy: "✨",
};

export const RARITY: Record<
  Rarity,
  { label: string; points: number; color: string; glow: string }
> = {
  common: { label: "COMMON", points: 100, color: "#9ca3af", glow: "#e5e7eb" },
  uncommon: { label: "UNCOMMON", points: 220, color: "#4ade80", glow: "#bbf7d0" },
  rare: { label: "RARE", points: 450, color: "#60a5fa", glow: "#bfdbfe" },
  legendary: { label: "LEGENDARY", points: 1200, color: "#fbbf24", glow: "#fde68a" },
};

const M = (
  id: number,
  name: string,
  types: string[],
  rarity: Rarity,
): Mon => ({ id, name, types, rarity });

export const MONS: Mon[] = [
  // common
  M(10, "Caterpie", ["bug"], "common"),
  M(13, "Weedle", ["bug", "poison"], "common"),
  M(16, "Pidgey", ["normal", "flying"], "common"),
  M(19, "Rattata", ["normal"], "common"),
  M(21, "Spearow", ["normal", "flying"], "common"),
  M(29, "Nidoran F", ["poison"], "common"),
  M(41, "Zubat", ["poison", "flying"], "common"),
  M(46, "Paras", ["bug", "grass"], "common"),
  M(48, "Venonat", ["bug", "poison"], "common"),
  M(60, "Poliwag", ["water"], "common"),
  M(63, "Abra", ["psychic"], "common"),
  M(69, "Bellsprout", ["grass", "poison"], "common"),
  M(72, "Tentacool", ["water", "poison"], "common"),
  M(74, "Geodude", ["rock", "ground"], "common"),
  M(81, "Magnemite", ["electric", "steel"], "common"),
  M(92, "Gastly", ["ghost", "poison"], "common"),
  M(100, "Voltorb", ["electric"], "common"),
  M(118, "Goldeen", ["water"], "common"),
  M(120, "Staryu", ["water"], "common"),
  M(129, "Magikarp", ["water"], "common"),
  M(161, "Sentret", ["normal"], "common"),
  M(163, "Hoothoot", ["normal", "flying"], "common"),
  M(165, "Ledyba", ["bug", "flying"], "common"),
  M(167, "Spinarak", ["bug", "poison"], "common"),
  M(183, "Marill", ["water", "fairy"], "common"),
  M(187, "Hoppip", ["grass", "flying"], "common"),
  M(191, "Sunkern", ["grass"], "common"),
  M(204, "Pineco", ["bug"], "common"),
  M(206, "Dunsparce", ["normal"], "common"),
  M(209, "Snubbull", ["fairy"], "common"),
  M(213, "Shuckle", ["bug", "rock"], "common"),
  M(220, "Swinub", ["ice", "ground"], "common"),
  M(231, "Phanpy", ["ground"], "common"),
  M(261, "Poochyena", ["dark"], "common"),
  M(263, "Zigzagoon", ["normal"], "common"),
  M(270, "Lotad", ["water", "grass"], "common"),
  M(276, "Taillow", ["normal", "flying"], "common"),
  M(285, "Shroomish", ["grass"], "common"),
  M(293, "Whismur", ["normal"], "common"),
  M(300, "Skitty", ["normal"], "common"),
  M(311, "Plusle", ["electric"], "common"),
  M(312, "Minun", ["electric"], "common"),
  M(316, "Gulpin", ["poison"], "common"),
  M(325, "Spoink", ["psychic"], "common"),
  M(328, "Trapinch", ["ground"], "common"),
  M(349, "Feebas", ["water"], "common"),
  M(361, "Snorunt", ["ice"], "common"),
  M(363, "Spheal", ["ice", "water"], "common"),
  M(396, "Starly", ["normal", "flying"], "common"),
  M(401, "Kricketot", ["bug"], "common"),
  M(412, "Burmy", ["bug", "grass"], "common"),
  M(422, "Shellos", ["water"], "common"),
  M(425, "Drifloon", ["ghost", "flying"], "common"),
  M(431, "Glameow", ["normal"], "common"),
  M(456, "Finneon", ["water"], "common"),
  M(509, "Purrloin", ["dark"], "common"),

  // uncommon
  M(1, "Bulbasaur", ["grass", "poison"], "uncommon"),
  M(4, "Charmander", ["fire"], "uncommon"),
  M(7, "Squirtle", ["water"], "uncommon"),
  M(25, "Pikachu", ["electric"], "uncommon"),
  M(35, "Clefairy", ["fairy"], "uncommon"),
  M(37, "Vulpix", ["fire"], "uncommon"),
  M(39, "Jigglypuff", ["normal", "fairy"], "uncommon"),
  M(43, "Oddish", ["grass", "poison"], "uncommon"),
  M(52, "Meowth", ["normal"], "uncommon"),
  M(54, "Psyduck", ["water"], "uncommon"),
  M(55, "Golduck", ["water"], "uncommon"),
  M(58, "Growlithe", ["fire"], "uncommon"),
  M(77, "Ponyta", ["fire"], "uncommon"),
  M(79, "Slowpoke", ["water", "psychic"], "uncommon"),
  M(83, "Farfetch'd", ["normal", "flying"], "uncommon"),
  M(84, "Doduo", ["normal", "flying"], "uncommon"),
  M(86, "Seel", ["water"], "uncommon"),
  M(90, "Shellder", ["water"], "uncommon"),
  M(95, "Onix", ["rock", "ground"], "uncommon"),
  M(104, "Cubone", ["ground"], "uncommon"),
  M(109, "Koffing", ["poison"], "uncommon"),
  M(111, "Rhyhorn", ["ground", "rock"], "uncommon"),
  M(113, "Chansey", ["normal"], "uncommon"),
  M(115, "Kangaskhan", ["normal"], "uncommon"),
  M(116, "Horsea", ["water"], "uncommon"),
  M(123, "Scyther", ["bug", "flying"], "uncommon"),
  M(127, "Pinsir", ["bug"], "uncommon"),
  M(131, "Lapras", ["water", "ice"], "uncommon"),
  M(133, "Eevee", ["normal"], "uncommon"),
  M(138, "Omanyte", ["rock", "water"], "uncommon"),
  M(140, "Kabuto", ["rock", "water"], "uncommon"),
  M(143, "Snorlax", ["normal"], "uncommon"),
  M(147, "Dratini", ["dragon"], "uncommon"),
  M(152, "Chikorita", ["grass"], "uncommon"),
  M(155, "Cyndaquil", ["fire"], "uncommon"),
  M(158, "Totodile", ["water"], "uncommon"),
  M(172, "Pichu", ["electric"], "uncommon"),
  M(175, "Togepi", ["fairy"], "uncommon"),
  M(179, "Mareep", ["electric"], "uncommon"),
  M(190, "Aipom", ["normal"], "uncommon"),
  M(194, "Wooper", ["water", "ground"], "uncommon"),
  M(200, "Misdreavus", ["ghost"], "uncommon"),
  M(202, "Wobbuffet", ["psychic"], "uncommon"),
  M(228, "Houndour", ["dark", "fire"], "uncommon"),
  M(234, "Stantler", ["normal"], "uncommon"),
  M(246, "Larvitar", ["rock", "ground"], "uncommon"),
  M(315, "Roselia", ["grass", "poison"], "uncommon"),
  M(355, "Duskull", ["ghost"], "uncommon"),
  M(371, "Bagon", ["dragon"], "uncommon"),
  M(393, "Piplup", ["water"], "uncommon"),
  M(403, "Shinx", ["electric"], "uncommon"),
  M(417, "Pachirisu", ["electric"], "uncommon"),
  M(447, "Riolu", ["fighting"], "uncommon"),
  M(453, "Croagunk", ["poison", "fighting"], "uncommon"),
  M(459, "Snover", ["grass", "ice"], "uncommon"),

  // rare
  M(3, "Venusaur", ["grass", "poison"], "rare"),
  M(6, "Charizard", ["fire", "flying"], "rare"),
  M(9, "Blastoise", ["water"], "rare"),
  M(26, "Raichu", ["electric"], "rare"),
  M(59, "Arcanine", ["fire"], "rare"),
  M(65, "Alakazam", ["psychic"], "rare"),
  M(68, "Machamp", ["fighting"], "rare"),
  M(71, "Victreebel", ["grass", "poison"], "rare"),
  M(78, "Rapidash", ["fire"], "rare"),
  M(94, "Gengar", ["ghost", "poison"], "rare"),
  M(121, "Starmie", ["water", "psychic"], "rare"),
  M(130, "Gyarados", ["water", "flying"], "rare"),
  M(141, "Kabutops", ["rock", "water"], "rare"),
  M(145, "Zapdos", ["electric", "flying"], "rare"),
  M(149, "Dragonite", ["dragon", "flying"], "rare"),
  M(157, "Typhlosion", ["fire"], "rare"),
  M(160, "Feraligatr", ["water"], "rare"),
  M(171, "Lanturn", ["water", "electric"], "rare"),
  M(181, "Ampharos", ["electric"], "rare"),
  M(196, "Espeon", ["psychic"], "rare"),
  M(197, "Umbreon", ["dark"], "rare"),
  M(212, "Scizor", ["bug", "steel"], "rare"),
  M(214, "Heracross", ["bug", "fighting"], "rare"),
  M(229, "Houndoom", ["dark", "fire"], "rare"),
  M(230, "Kingdra", ["water", "dragon"], "rare"),
  M(233, "Porygon2", ["normal"], "rare"),
  M(248, "Tyranitar", ["rock", "dark"], "rare"),
  M(254, "Sceptile", ["grass"], "rare"),
  M(257, "Blaziken", ["fire", "fighting"], "rare"),
  M(260, "Swampert", ["water", "ground"], "rare"),
  M(282, "Gardevoir", ["psychic", "fairy"], "rare"),
  M(289, "Slaking", ["normal"], "rare"),
  M(286, "Breloom", ["grass", "fighting"], "rare"),
  M(306, "Aggron", ["steel", "rock"], "rare"),
  M(319, "Sharpedo", ["water", "dark"], "rare"),
  M(330, "Flygon", ["ground", "dragon"], "rare"),
  M(334, "Altaria", ["dragon", "flying"], "rare"),
  M(350, "Milotic", ["water"], "rare"),
  M(373, "Salamence", ["dragon", "flying"], "rare"),
  M(376, "Metagross", ["steel", "psychic"], "rare"),
  M(392, "Infernape", ["fire", "fighting"], "rare"),
  M(395, "Empoleon", ["water", "steel"], "rare"),
  M(405, "Luxray", ["electric"], "rare"),
  M(428, "Lopunny", ["normal"], "rare"),
  M(445, "Garchomp", ["dragon", "ground"], "rare"),
  M(448, "Lucario", ["fighting", "steel"], "rare"),
  M(461, "Weavile", ["dark", "ice"], "rare"),
  M(462, "Magnezone", ["electric", "steel"], "rare"),
  M(468, "Togekiss", ["fairy", "flying"], "rare"),
  M(473, "Mamoswine", ["ice", "ground"], "rare"),
  M(479, "Rotom", ["electric", "ghost"], "rare"),
  M(530, "Excadrill", ["ground", "steel"], "rare"),

  // legendary
  M(144, "Articuno", ["ice", "flying"], "legendary"),
  M(146, "Moltres", ["fire", "flying"], "legendary"),
  M(150, "Mewtwo", ["psychic"], "legendary"),
  M(151, "Mew", ["psychic"], "legendary"),
  M(243, "Raikou", ["electric"], "legendary"),
  M(244, "Entei", ["fire"], "legendary"),
  M(245, "Suicune", ["water"], "legendary"),
  M(249, "Lugia", ["psychic", "flying"], "legendary"),
  M(250, "Ho-Oh", ["fire", "flying"], "legendary"),
  M(251, "Celebi", ["psychic", "grass"], "legendary"),
  M(377, "Regirock", ["rock"], "legendary"),
  M(378, "Regice", ["ice"], "legendary"),
  M(379, "Registeel", ["steel"], "legendary"),
  M(380, "Latias", ["dragon", "psychic"], "legendary"),
  M(381, "Latios", ["dragon", "psychic"], "legendary"),
  M(382, "Kyogre", ["water"], "legendary"),
  M(383, "Groudon", ["ground"], "legendary"),
  M(384, "Rayquaza", ["dragon", "flying"], "legendary"),
  M(385, "Jirachi", ["steel", "psychic"], "legendary"),
  M(386, "Deoxys", ["psychic"], "legendary"),
  M(483, "Dialga", ["steel", "dragon"], "legendary"),
  M(484, "Palkia", ["water", "dragon"], "legendary"),
  M(487, "Giratina", ["ghost", "dragon"], "legendary"),
  M(488, "Cresselia", ["psychic"], "legendary"),
  M(491, "Darkrai", ["dark"], "legendary"),
  M(493, "Arceus", ["normal"], "legendary"),
  M(638, "Cobalion", ["steel", "fighting"], "legendary"),
  M(641, "Tornadus", ["flying"], "legendary"),
  M(642, "Thundurus", ["electric", "flying"], "legendary"),
  M(645, "Landorus", ["ground", "flying"], "legendary"),
  M(646, "Kyurem", ["dragon", "ice"], "legendary"),
];

const TRAINERS = [
  "Ash", "Misty", "Brock", "Gary", "Prof. Oak", "Jessie", "James", "Nurse Joy",
  "Officer Jenny", "Erika", "Sabrina", "Blaine", "Koga", "Giovanni", "Lorelei",
  "Bruno", "Agatha", "Lance", "Red", "Blue", "Leaf", "Ethan", "Kris", "Lyra",
  "May", "Brendan", "Dawn", "Lucas", "Hilbert", "Hilda", "Nate", "Rosa",
  "Serena", "Calem", "Gladion", "Lillie", "Kukui", "Leon", "Hop", "Marnie",
  "Bede", "Nessa", "Milo", "Raihan", "Bea", "Allister", "Cynthia", "Steven",
  "Wallace", "Iris", "Alder", "Diantha", "N", "Lysandre", "Sophocles",
  "Lana", "Kiawe", "Mallow", "Ilima", "Riley", "Casey", "Jordan", "Sam",
  "Alex", "Rowan", "Sky", "Nova", "Kai", "Emz", "Bex", "Theo",
];

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const spriteUrl = (id: number, shiny = false) =>
  `${SPRITE_BASE}${shiny ? "/shiny" : ""}/${id}.png`;

export const artUrl = (id: number) =>
  `${SPRITE_BASE}/other/official-artwork/${id}.png`;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function segFor(mon: Mon, trainer: string, shiny: boolean, rocket: boolean): Segment {
  const base = rocket ? "#2b2d42" : TYPE_COLORS[mon.types[0]] ?? "#A8A77A";
  const alt = rocket ? "#5c1a1a" : TYPE_COLORS[mon.types[1] ?? mon.types[0]] ?? base;
  return {
    key: `${mon.id}-${trainer}-${shiny}-${rocket}-${Math.random().toString(36).slice(2, 7)}`,
    mon,
    trainer,
    shiny,
    rocket,
    color: mix(base, "#ffffff", 0.18),
    color2: mix(alt, "#ffffff", 0.1),
  };
}

export function matches(seg: Segment, obj: Objective): boolean {
  if (seg.rocket) return false;
  switch (obj.kind) {
    case "type":
      return seg.mon.types.includes(obj.type);
    case "mon":
      return seg.mon.id === obj.mon.id && seg.shiny === false;
    case "shiny":
      return seg.shiny;
    case "rarity":
      return seg.mon.rarity === obj.rarity;
    case "legendary":
      return seg.mon.rarity === "legendary";
  }
}

export function objectiveLabel(obj: Objective): { title: string; sub: string; emoji: string } {
  switch (obj.kind) {
    case "type":
      return {
        title: obj.type.toUpperCase(),
        sub: "Catch a " + obj.type.toUpperCase() + " type",
        emoji: TYPE_EMOJI[obj.type] ?? "❔",
      };
    case "mon":
      return { title: obj.mon.name.toUpperCase(), sub: "Catch " + obj.mon.name, emoji: "🎯" };
    case "shiny":
      return { title: "SHINY", sub: "Catch the SHINY Pokémon", emoji: "✨" };
    case "rarity":
      return {
        title: obj.rarity.toUpperCase(),
        sub: "Catch a " + obj.rarity.toUpperCase() + " Pokémon",
        emoji: "🏅",
      };
    case "legendary":
      return { title: "LEGENDARY", sub: "Catch a LEGENDARY Pokémon", emoji: "🌈" };
  }
}

export interface Round {
  segments: Segment[];
  objective: Objective;
  velocity: number;
  direction: 1 | -1;
  duration: number;
  jackpot: boolean;
  mode: Mode;
}

export type Mode = "classic" | "big" | "mega";

export interface ModeConfig {
  id: Mode;
  label: string;
  names: string;
  tagline: string;
  emoji: string;
  scoreMult: number;
  count: (level: number) => number;
  rockets: (level: number) => number;
  duration: (level: number) => number;
  velocity: (level: number) => number;
  wanted: (o: Objective, level: number, slots: number) => number;
}

export const MODES: Record<Mode, ModeConfig> = {
  classic: {
    id: "classic",
    label: "CLASSIC",
    names: "8–12 names",
    tagline: "Short, punchy reads",
    emoji: "🎯",
    scoreMult: 1,
    count: (l) => Math.min(8 + Math.floor((l - 1) / 2), 12),
    rockets: (l) => (l >= 5 ? 2 : l >= 2 ? 1 : 0),
    duration: (l) => Math.max(4.2, 9 - (l - 1) * 0.45),
    velocity: (l) => {
      const count = Math.min(8 + Math.floor((l - 1) / 2), 12);
      const segTime = Math.max(0.155, 0.34 - (l - 1) * 0.024);
      return Math.min(400, 360 / count / segTime);
    },
    wanted: (o, level, slots) => {
      let n = 1;
      if (o.kind === "type") n = level <= 2 ? 3 : 2;
      if (o.kind === "rarity") n = level <= 4 ? 3 : 2;
      if (o.kind === "legendary") n = Math.random() < 0.5 ? 2 : 1;
      return Math.min(n, Math.max(1, Math.floor(slots * 0.45)));
    },
  },
  big: {
    id: "big",
    label: "BIG WHEEL",
    names: "50 names",
    tagline: "Crowded board, big reads",
    emoji: "🎡",
    scoreMult: 1.35,
    count: () => 50,
    rockets: () => 3,
    duration: (l) => Math.max(7.5, 13 - (l - 1) * 0.5),
    velocity: (l) => Math.min(265, 152 + (l - 1) * 8),
    wanted: (o, _l, slots) => {
      let n = 7;
      if (o.kind === "rarity") n = 9;
      if (o.kind === "legendary") n = 5;
      if (o.kind === "shiny") n = 3;
      return Math.min(n, Math.max(1, Math.round(slots * 0.4)));
    },
  },
  mega: {
    id: "mega",
    label: "MEGA WHEEL",
    names: "100 names",
    tagline: "The full Pokédex board",
    emoji: "🌈",
    scoreMult: 1.8,
    count: () => 100,
    rockets: () => 5,
    duration: (l) => Math.max(10, 16 - (l - 1) * 0.55),
    velocity: (l) => Math.min(300, 168 + (l - 1) * 7),
    wanted: (o, _l, slots) => {
      let n = 16;
      if (o.kind === "rarity") n = 18;
      if (o.kind === "legendary") n = 9;
      if (o.kind === "shiny") n = 5;
      return Math.min(n, Math.max(1, Math.round(slots * 0.35)));
    },
  },
};

export const MODE_ORDER: Mode[] = ["classic", "big", "mega"];

/** Types with enough non-legendary Pokémon to fill a crowded wheel. */
function richTypes(min: number): string[] {
  return Object.keys(TYPE_COLORS).filter(
    (t) =>
      MONS.filter((m) => m.types.includes(t) && m.rarity !== "legendary").length >= min,
  );
}

function chooseObjective(level: number, jackpot: boolean, mode: Mode): Objective {
  if (jackpot) return { kind: "legendary" };
  if (mode === "classic") {
    if (level === 1) return { kind: "type", type: pick(["fire", "water", "grass", "electric"]) };
    if (level === 2) return { kind: "type", type: pick(richTypes(4)) };
    if (level === 4) return { kind: "rarity", rarity: pick(["uncommon", "rare"] as Rarity[]) };
    if (level >= 3 && Math.random() < 0.55) {
      const pool = MONS.filter((m) => m.rarity !== "legendary");
      return { kind: "mon", mon: pick(pool) };
    }
    if (Math.random() < 0.4) return { kind: "shiny" };
    return { kind: "type", type: pick(richTypes(4)) };
  }
  // crowded wheels: only objectives with several matching wedges stay fair
  const roll = Math.random();
  if (roll < 0.62) return { kind: "type", type: pick(richTypes(14)) };
  if (roll < 0.9) {
    return { kind: "rarity", rarity: pick(["common", "uncommon", "rare"] as Rarity[]) };
  }
  return { kind: "shiny" };
}

export function buildRound(level: number, mode: Mode = "classic"): Round {
  const cfg = MODES[mode];
  const count = cfg.count(level);
  const rockets = cfg.rockets(level);
  const slots = count - rockets;

  const jackpot = level % 4 === 0 && level >= 4;

  const initialObjective = chooseObjective(level, jackpot, mode);

  // how many matching segments should exist — never asks for more than the
  // Pokédex can actually supply, so crowded boards stay winnable
  const matchesWantedFor = (o: Objective) => {
    let n = cfg.wanted(o, level, slots);
    const pool = MONS.filter(
      (m) => m.rarity !== "legendary" && matches(segFor(m, "", false, false), o),
    ).length;
    if (pool > 0) n = Math.min(n, Math.max(3, Math.floor(pool * 0.72)));
    return Math.min(n, Math.max(1, Math.floor(slots * 0.45)));
  };

  const chosen: Mon[] = [];
  const used = new Set<number>();

  const grab = (filter: (m: Mon) => boolean, n: number) => {
    const pool = shuffle(MONS.filter((m) => !used.has(m.id) && filter(m)));
    for (const m of pool.slice(0, n)) {
      chosen.push(m);
      used.add(m.id);
    }
  };

  const fill = (obj: Objective, wanted: number) => {
    if (obj.kind === "mon") {
      used.add(obj.mon.id);
      chosen.push(obj.mon);
    } else if (obj.kind === "type") {
      grab((m) => m.types.includes(obj.type), wanted);
    } else if (obj.kind === "rarity") {
      grab((m) => m.rarity === obj.rarity, wanted);
    } else if (obj.kind === "legendary") {
      grab((m) => m.rarity === "legendary", wanted);
    } else if (obj.kind === "shiny") {
      grab((m) => m.rarity === "uncommon" || m.rarity === "rare", wanted);
    }
  };

  const obj: Objective = (() => {
    const first = initialObjective;
    fill(first, matchesWantedFor(first));
    if (chosen.length === 0) {
      chosen.length = 0;
      used.clear();
      const rich = richTypes(6);
      const fallback: Objective = {
        kind: "type",
        type: rich.length ? pick(rich) : "normal",
      };
      fill(fallback, matchesWantedFor(fallback));
      return fallback;
    }
    return first;
  })();

  // fillers never match
  grab(
    (m) => !matches(segFor(m, "", false, false), obj) && m.rarity !== "legendary",
    slots - chosen.length,
  );

  while (chosen.length < slots) {
    grab((m) => m.rarity === "common", slots - chosen.length);
    if (chosen.length < slots) {
      const rest = MONS.filter((m) => m.rarity === "common" && !used.has(m.id));
      if (rest.length === 0) break;
      const m = pick(rest);
      chosen.push(m);
      used.add(m.id);
    }
  }

  const mons = shuffle(chosen.slice(0, slots));
  while (mons.length < slots) mons.push(pick(MONS.filter((m) => m.rarity === "common")));
  const trainers = shuffle(TRAINERS);
  const segments: Segment[] = [];
  let shinyAssigned = obj.kind === "shiny" ? 0 : -1;

  for (let i = 0; i < count; i++) {
    if (i >= count - rockets) {
      segments.push(segFor(M(52, "Meowth", ["dark"], "common"), "Team Rocket", false, true));
      continue;
    }
    const mon = mons[i];
    let shiny = false;
    if (obj.kind === "shiny" && shinyAssigned === 0) {
      shiny = true;
      shinyAssigned = 1;
    }
    segments.push(segFor(mon, trainers[i % trainers.length], shiny, false));
  }

  return {
    segments: shuffle(segments),
    objective: obj,
    velocity: cfg.velocity(level),
    direction: Math.random() < 0.5 ? 1 : -1,
    duration: cfg.duration(level),
    jackpot,
    mode,
  };
}

export function preloadSprites() {
  const ids = Array.from(new Set(MONS.map((m) => m.id)));
  let i = 0;
  const step = () => {
    for (const id of ids.slice(i, i + 4)) {
      const img = new Image();
      img.decoding = "async";
      img.src = spriteUrl(id);
    }
    i += 4;
    if (i < ids.length) window.setTimeout(step, 260);
  };
  window.setTimeout(step, 600);
}
