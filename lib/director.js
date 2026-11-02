// Builds a scene-by-scene execution card for an idea. Template version, no AI needed.
import { moodFor } from "./generator";

const CAMERA = {
  Aesthetic: "Slow pans and static shots. Hold each shot 3 seconds. One close-up of a texture.",
  Relatable: "Eye-level and handheld. Slightly imperfect framing is fine and feels real.",
  Storytelling: "Start over-the-shoulder, then reveal your face on the last beat.",
  "Mini-vlog": "Phone on a stand at chest height. Talk to the camera once, then cut to b-roll.",
  Funny: "Hold the wide shot longer than is comfortable. The stillness is the joke.",
  Cinematic: "Shots of 2 to 3 seconds. One slow push-in on the key moment.",
};

const EDIT_STEPS = [
  "Target 15 to 25 seconds total. Cut any clip still moving after two seconds.",
  "Import clips in shot order. Trim each one to its best 1 to 2 seconds.",
  "Add the music first, then cut on the beat. Without beat markers, cut roughly every 1.5 seconds.",
  "Add text: one line per scene, large and centred, on screen at least 2 seconds.",
  "Use hard cuts for most transitions. Use one soft fade, at the end only.",
  "Pick one filter and lower its strength to about 70 percent so skin and light still look natural.",
  "Export at 1080 by 1920 (9:16), 30 fps. Post as a Reel and choose scene 1 as the cover.",
];

export function buildCard({ title, concept = "", angle = "Relatable", mood }) {
  const s = title.trim().replace(/[.!?]+$/, "");
  return {
    hooks: [
      `Open on the single detail that stands for "${s}". No talking for two seconds.`,
      `Start late: show the result of "${s}" first, then the moment that caused it.`,
      `Text on screen in the first second: "${s}". Then cut to the first shot.`,
    ],
    scenes: [
      { time: "0 to 2s", visual: `Close-up of the detail that stands for "${s}". Phone still.`, text: "Hook line, six words or fewer" },
      { time: "2 to 6s", visual: "Wide shot of where it happens. Hold 3 seconds so the place registers.", text: "" },
      { time: "6 to 12s", visual: `Medium shot of you doing the one action connected to "${s}".`, text: "One short line" },
      { time: "12 to 18s", visual: "Detail cuts: hands, light, texture. One cut every 1 to 2 seconds.", text: "" },
      { time: "18 to 25s", visual: "End on a quiet frame. Hold 2 seconds before the cut.", text: "Last line, or none" },
    ],
    camera: CAMERA[angle] || CAMERA.Relatable,
    mood: mood || moodFor(angle),
    captions: [
      `${s}. That's the whole post.`,
      "Didn't plan this. Glad I filmed it.",
      "Save this for a day you need it.",
    ],
    editSteps: EDIT_STEPS,
    tools:
      "Start in Instagram's built-in editor: tap + then Reel, then Edit. For animated text or split screens, use CapCut (free). Menus change between versions, so follow the goal of each step, not the exact button position.",
    note: concept,
  };
}
