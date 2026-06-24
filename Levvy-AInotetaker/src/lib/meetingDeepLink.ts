export function meetingUrl(meetingId: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const path = base.includes("levvy-ai-notetaker")
    ? base
    : `${window.location.origin}/levvy-ai-notetaker`;
  return `${path}?meeting=${encodeURIComponent(meetingId)}`;
}

export function meetingDeepLinkHtml(
  meetingId: string,
  meetingTitle?: string,
  meetingDate?: string,
  meetingTime?: string,
): string {
  const url = meetingUrl(meetingId);
  const parts: string[] = [];
  if (meetingTitle) parts.push(meetingTitle);
  if (meetingDate) parts.push(meetingDate);
  if (meetingTime) parts.push(meetingTime);
  const info = parts.length > 0 ? ` (${parts.join(", ")})` : "";
  return `<p><a href="${url}">View original meeting notes</a>${info}</p>`;
}

export function appendMeetingLinkToNotes(
  notesHtml: string,
  meetingId: string,
  meetingTitle?: string,
  meetingDate?: string,
  meetingTime?: string,
): string {
  const link = meetingDeepLinkHtml(
    meetingId,
    meetingTitle,
    meetingDate,
    meetingTime,
  );
  if (notesHtml.includes("View original meeting notes")) return notesHtml;
  return notesHtml + link;
}

export function parseMeetingIdFromSearch(
  search: string,
): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  return params.get("meeting");
}
