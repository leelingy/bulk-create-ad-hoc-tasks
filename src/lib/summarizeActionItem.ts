const VERBS = [
  "Review",
  "Update",
  "Fix",
  "Build",
  "Create",
  "Share",
  "Investigate",
  "Report",
  "Add",
  "Discuss",
  "Implement",
  "Prepare",
  "Send",
  "Schedule",
  "Complete",
  "Follow",
  "Reconcile",
  "Categorize",
];

export function summarizeActionItem(text: string): string {
  const cleaned = text.replace(/^[\s\-*•\d\.\)]+/, "").trim();
  if (!cleaned) return "Review follow-up";

  const words = cleaned.split(/\s+/).filter(Boolean);
  const first = words[0]?.replace(/[^a-zA-Z]/g, "") ?? "";
  const startsWithVerb = VERBS.some(
    (v) => v.toLowerCase() === first.toLowerCase(),
  );

  if (startsWithVerb) {
    return words.slice(0, 8).join(" ");
  }

  const core = words.slice(0, 7).join(" ");
  return core ? `Review ${core}` : "Review follow-up";
}

export function genericMeetingTaskName(meetingTitle: string): string {
  const title = meetingTitle.trim();
  return title ? `Action items from ${title}` : "Action items from meeting";
}
