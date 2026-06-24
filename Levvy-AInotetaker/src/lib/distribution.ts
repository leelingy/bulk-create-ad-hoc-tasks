import type {
  Client,
  DistributionChannel,
  Guest,
  GuestDistributionRow,
} from "../types";

export type ContactMatch = {
  clientId: string;
  clientName: string;
  contactName: string;
  email: string;
};

export function findContactMatchesByEmail(
  email: string,
  clients: Client[],
): ContactMatch[] {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  const matches: ContactMatch[] = [];
  for (const client of clients) {
    for (const contact of client.contacts) {
      if (contact.email.trim().toLowerCase() === normalized) {
        matches.push({
          clientId: client.id,
          clientName: client.name,
          contactName: contact.name,
          email: contact.email,
        });
      }
    }
  }
  return matches;
}

export function buildGuestDistributionRows(
  guests: Guest[],
  meetingClient: Client,
  allClients: Client[],
): GuestDistributionRow[] {
  return guests.map((guest) => {
    const email = guest.email?.trim() ?? "";
    const allMatches = findContactMatchesByEmail(email, allClients);
    const matchedOnMeetingClient = allMatches.some(
      (m) => m.clientId === meetingClient.id,
    );
    const otherMatchingClients = allMatches
      .filter((m) => m.clientId !== meetingClient.id)
      .map((m) => m.clientName);
    const portalEligible =
      !!email && matchedOnMeetingClient && meetingClient.hasPortal;
    const emailOnly = !!email && !portalEligible;

    let channel: DistributionChannel = "email";
    if (portalEligible) channel = "portal";
    else if (!email) channel = "email";

    return {
      guest,
      channel,
      portalEligible,
      emailOnly,
      matchedOnMeetingClient,
      otherMatchingClients,
    };
  });
}
