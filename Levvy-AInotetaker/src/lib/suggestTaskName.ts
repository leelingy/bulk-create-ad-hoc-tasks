import { summarizeActionItem } from "./summarizeActionItem";

export function suggestTaskNameFromNotes(notes: string): string {
  return summarizeActionItem(notes);
}

export function genericMeetingTaskName(meetingTitle: string): string {
  const title = meetingTitle.trim();
  return title ? `Action items from ${title}` : "Action items from meeting";
}
