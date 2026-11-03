// Built-in idea engine. Works with no AI key and no internet.
// Everything here is doable at home or in the village, with no money.
// Remembers past titles (passed in as `avoid`) so it does not repeat itself.

export const SEEDS = [
  "the morning milk being boiled", "the courtyard after the first rain", "a clay pot cooling on the step",
  "the well rope and the bucket", "red chillies drying on the terrace", "the mango tree in the lane",
  "a neighbour calling from over the wall", "the first oil lamp at dusk", "rangoli at the doorstep",
  "the sound of the grinder in the kitchen", "a steel tiffin packed for someone", "bangles clinking while cooking",
  "the wall calendar with the day crossed off", "the goat coming back down the lane", "the tea stove at dawn",
  "a bucket of water in the sun", "the paddy field edge at sunset", "grandmother's old steel box",
  "washing drying on the rope", "the tin roof during a storm", "mending a torn dupatta by hand",
  "a hand-pounded mortar and pestle", "flowers picked from the garden", "the kitchen window in the afternoon",
  "a broom and a swept courtyard", "a cup of tea shared on the doorstep", "the pickle jar in the sun",
  "the hand pump in the morning", "a cow bell far away in the fields", "the terrace at sunset with the wind",
  "a lost slipper found at the gate", "the first monsoon smell from the earth", "wet mud footprints on the floor",
  "a lamp lit in the temple corner of the house", "the old radio in the kitchen", "a bundle of firewood in the corner",
];

export const ANGLES = ["Aesthetic", "Relatable", "Storytelling", "Mini-vlog", "Funny", "Cinematic"];

const MOODS = {
  Aesthetic: "Soft, slow, warm light. A soft instrumental or natural sounds like birds and the wind.",
  Relatable: "Casual and a little messy. Natural household sounds, or a familiar folk-pop track.",
  Storytelling: "Start quiet, build to one lift, then silence. Simple strings or a flute works well.",
  "Mini-vlog": "Natural sounds from the house with one light instrumental under it.",
  Funny: "Keep audio minimal so the timing carries the joke.",
  Cinematic: "Slow swell with one clear drop. Choose one track and cut to it.",
};

const cap = (s) => s[0].toUpperCase() + s.slice(1);

// Each template is written for one angle, so titles fit her style and her home.
const TEMPLATES = {
  Aesthetic: [
    (s) => `${cap(s)}, filmed slowly with only the light`,
    (s) => `Ten quiet seconds of ${s}`,
  ],
  Relatable: [
    (s) => `Nobody films ${s}, but it is my whole morning`,
    (s) => `The part of my day that is always ${s}`,
    (s) => `${cap(s)}: what it looks like from my side`,
  ],
  Storytelling: [
    (s) => `It started with ${s}, and then the day changed`,
    (s) => `A small story that happens through ${s}`,
  ],
  "Mini-vlog": [
    (s) => `A simple home day that starts with ${s}`,
    (s) => `Doing my work at home, beginning with ${s}`,
  ],
  Funny: [
    (s) => `When ${s} becomes the whole plan for today`,
    (s) => `Me explaining ${s} to someone who was not there`,
  ],
  Cinematic: [
    (s) => `${cap(s)}, with the camera standing still`,
    (s) => `Three shots of ${s} and one small surprise`,
  ],
};

const HOOKS = [
  (s) => `Open on ${s}. No face for the first two seconds.`,
  (s) => `Start one moment before ${s} actually happens.`,
  (s) => `On-screen text over ${s}: "I didn't plan this, but here we are."`,
  (s) => `Hard cut from a wide shot to a close-up of ${s}.`,
];

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const norm = (t) => String(t || "").trim().toLowerCase().replace(/\s+/g, " ");
export const moodFor = (angle) => MOODS[angle] || MOODS.Relatable;

export function generateIdea({ avoid = [] } = {}) {
  const taken = new Set(avoid.map(norm));
  let best = null;
  for (let i = 0; i < 60; i++) {
    const angle = pick(ANGLES);
    const seed = pick(SEEDS);
    const title = pick(TEMPLATES[angle])(seed);
    best = { angle, seed, title };
    if (!taken.has(norm(title))) break;
  }
  return {
    title: best.title,
    seed: best.seed,
    angle: best.angle,
    hook: pick(HOOKS)(best.seed),
    concept: `This ${best.angle.toLowerCase()} reel is built around ${best.seed}. It needs only a phone and the house.`,
    mood: moodFor(best.angle),
  };
}
