// Built-in idea engine. Works with no AI key and no internet.
// Remembers past titles (passed in as `avoid`) so it does not repeat itself.
// Honest limit: templates repeat more than a live AI. Add a free Gemini key for fresher ideas.

export const SEEDS = [
  "a warm hug", "the 3am kitchen", "a borrowed umbrella", "rain on a tin roof",
  "a half-finished cup of chai", "an old playlist", "the last bus home", "a handwritten note",
  "a Sunday with no plans", "fresh bread", "a plant that survived", "the first cold morning",
  "the quiet after a phone call", "a friend's laugh in a crowd", "an unsent message",
  "a cupboard you finally cleaned", "a train window at dusk", "a neighbour's cat",
  "the hour before sunrise", "a new pair of socks", "a sticky note on the mirror",
  "the sound of a kettle", "a shirt that still smells like home", "a puddle with a reflection",
  "a bag of groceries that is too heavy", "the first sip of coffee", "a lift stuck between floors",
  "a dog that waits at the gate", "a bookshop corner", "a forgotten jacket in the car",
  "a window seat at a cafe", "the blue hour on a balcony", "a mirror selfie you almost deleted",
  "a phone at 2% battery", "a long walk with no destination", "the smell of rain on dry road",
  "a bike ride with no music", "a shelf of half-read books", "a candle burning down",
];

export const ANGLES = ["Aesthetic", "Relatable", "Storytelling", "Mini-vlog", "Funny", "Cinematic"];

const MOODS = {
  Aesthetic: "Soft, slow, warm light. Instrumental lo-fi or ambient, no lyrics.",
  Relatable: "Casual and a little messy. Familiar acoustic pop, or natural room sound.",
  Storytelling: "Start quiet, build to one lift, then silence. Piano or strings work well.",
  "Mini-vlog": "Natural room sound with one light instrumental under it.",
  Funny: "Keep audio minimal so the timing carries the joke.",
  Cinematic: "Slow swell with one clear drop. Choose one track and cut to it.",
};

const cap = (s) => s[0].toUpperCase() + s.slice(1);

// Each template is written for one angle, so titles fit their style.
const TEMPLATES = {
  Aesthetic: [
    (s) => `${cap(s)}, filmed slowly with the light doing the work`,
    (s) => `Ten seconds of ${s}, no talking`,
  ],
  Relatable: [
    (s) => `Nobody films ${s}. I did, and it felt familiar`,
    (s) => `The part of my day that is secretly ${s}`,
    (s) => `${cap(s)}: the honest version`,
  ],
  Storytelling: [
    (s) => `A short story that only happens through ${s}`,
    (s) => `It started with ${s}. Here is how the day went`,
  ],
  "Mini-vlog": [
    (s) => `A day that somehow became about ${s}`,
    (s) => `Filming my routine, starting with ${s}`,
  ],
  Funny: [
    (s) => `When ${s} is the only plan you have today`,
    (s) => `Me explaining ${s} to someone who was not there`,
  ],
  Cinematic: [
    (s) => `${cap(s)}, scene one of a film nobody asked for`,
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
    concept: `A ${best.angle.toLowerCase()} reel built around ${best.seed}. Shoot it on your phone in under an hour, using things already in your home.`,
    mood: moodFor(best.angle),
  };
}
