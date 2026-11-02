// Built-in idea engine. Works with no AI key and no internet.
// Remembers past titles (passed in as `avoid`) so it does not repeat itself.

export const SEEDS = [
  "a warm hug",
  "the 3am kitchen",
  "a borrowed umbrella",
  "rain on a tin roof",
  "a half-finished cup of chai",
  "an old playlist",
  "the last bus home",
  "a handwritten note",
  "a Sunday with no plans",
  "fresh bread",
  "a plant that survived",
  "the first cold morning",
  "the quiet after a phone call",
  "a friend's laugh in a crowd",
  "an unsent message",
  "a cupboard you finally cleaned",
  "a train window at dusk",
  "a neighbour's cat",
  "the hour before sunrise",
  "a new pair of socks",
];

export const ANGLES = ["Aesthetic", "Relatable", "Storytelling", "Mini-vlog", "Funny", "Cinematic"];

const MOODS = {
  Aesthetic: "Soft, slow, warm light. Instrumental lo-fi or ambient, no lyrics.",
  Relatable: "Casual and a little messy. Familiar acoustic pop, or no music with natural sound.",
  Storytelling: "Start quiet, build to one lift, then silence. Piano or strings work well.",
  "Mini-vlog": "Natural room sound with one light instrumental under it.",
  Funny: "Keep audio minimal so the timing carries the joke.",
  Cinematic: "Slow swell with one clear drop. Choose one track and cut to it.",
};

const TITLES = [
  (s) => `Things that feel like ${s} but nobody talks about`,
  (s) => `${s[0].toUpperCase() + s.slice(1)}, filmed like a movie scene`,
  (s) => `A short story told only through ${s}`,
  (s) => `The part of your day that is secretly ${s}`,
  (s) => `Trying to capture ${s} in 15 seconds`,
  (s) => `Me, alone, and ${s}`,
];

const HOOKS = [
  (s) => `Open on ${s}. No face for the first two seconds.`,
  (s) => `Start one moment before ${s} actually happens.`,
  (s) => `On-screen text over ${s}: "I didn't plan this, but here we are."`,
];

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const norm = (t) => String(t || "").trim().toLowerCase().replace(/\s+/g, " ");
export const moodFor = (angle) => MOODS[angle] || MOODS.Relatable;

export function generateIdea({ avoid = [] } = {}) {
  const taken = new Set(avoid.map(norm));
  let choice = null;
  for (let i = 0; i < 40; i++) {
    const seed = pick(SEEDS);
    const title = pick(TITLES)(seed);
    choice = { seed, title };
    if (!taken.has(norm(title))) break;
  }
  const angle = pick(ANGLES);
  return {
    title: choice.title,
    seed: choice.seed,
    angle,
    hook: pick(HOOKS)(choice.seed),
    concept: `A ${angle.toLowerCase()} reel built around ${choice.seed}. Shoot it on your phone in under an hour, using things already in your home.`,
    mood: moodFor(angle),
  };
}
