// Rule-based replies for the creative assistant. Used when no AI key is set,
// and as the action buttons shown with every reply.

const RULES = {
  no_ideas: {
    reply:
      "Skip the blank page. Go to Home and get an idea, then pick the one that makes you slightly curious. Before reading its breakdown, sketch three shots of it yourself, then compare.",
    action: { href: "/", label: "Get an idea" },
  },
  no_execution: {
    reply:
      "Tell me the idea in one sentence. Most short reels work with this shape: a strong opening shot, a wide shot for context, two or three close-ups, and a quiet ending. The Reel Director will break your idea into exactly that.",
    action: { href: "/create", label: "Open Reel Director" },
  },
  bad_reel: {
    reply:
      "Most weak reels fail on the first thing they get wrong. Check in this order: 1) Did the first two seconds give a reason to keep watching? 2) Was the light in front of you, not behind? 3) Did any clip sit still for more than 4 seconds? 4) Did the music fight the visuals? Tell me which one felt wrong and we will fix only that part.",
    action: { href: "/create", label: "Re-cut with Reel Director" },
  },
  alone: {
    reply:
      "Solo setup that works: phone on a stack of books or a cheap stand at eye level, 3-second timer, and three takes of each shot. Keep the best take. Use a wide shot for the setup and a close-up for the moment. Do not move the phone during a shot.",
    action: { href: "/create", label: "Plan a solo shoot" },
  },
  demotivated: {
    reply:
      "Set a 20-minute target instead of a post target. Open My Studio, pick one idea you already saved, and shoot only its first two scenes. That is enough for today.",
    action: { href: "/studio", label: "Open My Studio" },
  },
};

export function ruleReply(situation) {
  const rule = RULES[situation];
  if (rule) return rule;
  return {
    reply:
      "Tell me what you want to make today, in one line. I will point you to the right step.",
    action: null,
  };
}
