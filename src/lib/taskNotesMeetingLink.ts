/** Appended to generated task notes; users may delete this line. */
export const MEETING_SUMMARY_LINE = "View meeting summary";

export function notesEndWithMeetingSummary(notes: string): boolean {
  const lines = notes.split(/\r?\n/);
  const last = lines[lines.length - 1]?.trim();
  return last === MEETING_SUMMARY_LINE;
}

export function stripMeetingSummaryFromNotes(notes: string): string {
  return notes
    .split(/\r?\n/)
    .filter((line) => line.trim() !== MEETING_SUMMARY_LINE)
    .join("\n")
    .trimEnd();
}

/** Add the meeting summary line on the line after the last bullet / note line. */
export function appendMeetingSummaryLine(notes: string): string {
  const body = stripMeetingSummaryFromNotes(notes).trimEnd();
  if (!body) return MEETING_SUMMARY_LINE;
  return `${body}\n${MEETING_SUMMARY_LINE}`;
}
