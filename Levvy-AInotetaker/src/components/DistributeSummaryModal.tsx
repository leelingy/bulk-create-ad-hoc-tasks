import React, { useEffect, useState } from "react";
import type {
  Client,
  DistributionChannel,
  Guest,
  Meeting,
  TaskDraft,
} from "../types";
import { buildGuestDistributionRows } from "../lib/distribution";
import "./Modal.css";
import "./DistributeSummaryModal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  allClients: Client[];
  clientActionItems?: TaskDraft[];
};

const DistributeSummaryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  meeting,
  allClients,
  clientActionItems = [],
}) => {
  const [rows, setRows] = useState(
    buildGuestDistributionRows(meeting.guests, meeting.client, allClients),
  );
  const [success, setSuccess] = useState(false);
  const [includeActionItems, setIncludeActionItems] = useState(true);
  const [actionRequired, setActionRequired] = useState(true);

  const actionItemsSubject = `Action items from ${meeting.title}`;
  const hasActionItems = clientActionItems.length > 0;

  useEffect(() => {
    if (isOpen) {
      setRows(
        buildGuestDistributionRows(meeting.guests, meeting.client, allClients),
      );
      setSuccess(false);
      setIncludeActionItems(true);
      setActionRequired(true);
    }
  }, [isOpen, meeting, allClients]);

  const setChannel = (guest: Guest, channel: DistributionChannel) => {
    setRows((prev) =>
      prev.map((r) =>
        r.guest.email === guest.email && r.guest.name === guest.name
          ? { ...r, channel }
          : r,
      ),
    );
  };

  const handleShare = () => {
    const payload = {
      meetingId: meeting.id,
      recipients: rows.map((r) => ({ guest: r.guest, channel: r.channel })),
      actionItems:
        hasActionItems && includeActionItems
          ? {
              subject: actionItemsSubject,
              actionRequired,
              items: clientActionItems.map((i) => i.notes),
            }
          : null,
    };
    console.log("Sharing meeting summary:", payload);
    setSuccess(true);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content distribute-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Share meeting summary</h2>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="distribute-success">
              Summary shared with selected recipients via their chosen channels.
              {hasActionItems && includeActionItems && (
                <>
                  {" "}
                  Action items sent as “{actionItemsSubject}”
                  {actionRequired ? " and marked action required." : "."}
                </>
              )}
            </div>
          ) : (
            <p className="distribute-intro">
              Meeting client: <strong>{meeting.client.name}</strong>. Portal is
              only available when a guest&apos;s email matches a contact on this
              client and the client has portals enabled.
            </p>
          )}

          <div className="distribute-list">
            {rows.map((row) => {
              const badge = !row.guest.email
                ? { cls: "none", label: "No email" }
                : row.otherMatchingClients.length > 0
                  ? { cls: "multi", label: "Multi-client match" }
                  : row.portalEligible
                    ? { cls: "portal", label: "Portal eligible" }
                    : { cls: "email", label: "Email only" };

              return (
                <div key={`${row.guest.email}-${row.guest.name}`} className="distribute-row">
                  <div className="distribute-row-header">
                    <div>
                      <div className="distribute-guest-name">{row.guest.name}</div>
                      <div className="distribute-guest-email">
                        {row.guest.email || "No email address"}
                      </div>
                    </div>
                    <span className={`distribute-badge ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {row.otherMatchingClients.length > 0 && (
                    <p className="distribute-hint">
                      Also on: {row.otherMatchingClients.join(", ")}. Change the
                      meeting client if portal should use a different client.
                    </p>
                  )}

                  {row.guest.email && (
                    <div className="distribute-channels">
                      <label
                        className={`distribute-channel-label ${!row.portalEligible ? "disabled" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`channel-${row.guest.email}`}
                          checked={row.channel === "portal"}
                          disabled={!row.portalEligible}
                          onChange={() => setChannel(row.guest, "portal")}
                        />
                        Client portal
                      </label>
                      <label className="distribute-channel-label">
                        <input
                          type="radio"
                          name={`channel-${row.guest.email}`}
                          checked={row.channel === "email"}
                          onChange={() => setChannel(row.guest, "email")}
                        />
                        Email
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasActionItems && (
            <div className="distribute-action-items">
              <label className="distribute-action-toggle">
                <input
                  type="checkbox"
                  checked={includeActionItems}
                  onChange={(e) => setIncludeActionItems(e.target.checked)}
                />
                Send action items to the client
              </label>

              {includeActionItems && (
                <>
                  <div className="distribute-action-subject">
                    Subject: <strong>{actionItemsSubject}</strong>
                  </div>
                  <ul className="distribute-action-list">
                    {clientActionItems.map((item) => (
                      <li key={item.id}>{item.notes}</li>
                    ))}
                  </ul>
                  <label className="distribute-action-toggle">
                    <input
                      type="checkbox"
                      checked={actionRequired}
                      onChange={(e) => setActionRequired(e.target.checked)}
                    />
                    Mark as action required
                  </label>
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="footer-buttons">
            <button type="button" className="button button-secondary" onClick={onClose}>
              {success ? "Close" : "Cancel"}
            </button>
            {!success && (
              <button type="button" className="button button-primary" onClick={handleShare}>
                Share summary
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributeSummaryModal;
