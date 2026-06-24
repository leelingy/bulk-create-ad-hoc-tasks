"use client";

import { useEffect, useState } from "react";
import {
  levvyBtnPrimaryClass,
  levvyBtnSecondaryClass,
  levvyFocusRingClass,
} from "../workspace/levvyModalTokens";

export const CLIENT_LOOP_TAGS = [
  "None",
  "AP intake automation-v10",
  "Fractional CFO Consulting",
  "Onboarding",
] as const;

type Props = {
  open: boolean;
  meetingTitle: string;
  defaultClient: string;
  clientOptions: string[];
  notes: string;
  onClose: () => void;
};

function ComposeForm({
  meetingTitle,
  defaultClient,
  clientOptions,
  notes,
  onClose,
}: Omit<Props, "open">) {
  const [client, setClient] = useState(defaultClient);
  const [subject, setSubject] = useState(`Recap from ${meetingTitle}`);
  const [tag, setTag] = useState<string>(CLIENT_LOOP_TAGS[0]);
  const [message, setMessage] = useState(notes);
  const [replyNeeded, setReplyNeeded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setMessage(notes);
  }, [notes]);

  const handleSend = () => {
    setError(null);
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!message.trim()) {
      setError("Message is required.");
      return;
    }
    console.log("Sending notes via Client Loop:", {
      client,
      subject: subject.trim(),
      tag: tag === "None" ? null : tag,
      message: message.trim(),
      replyNeeded,
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-4 px-5 py-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          <p className="font-semibold">Message sent to {client}.</p>
          <p className="mt-1">
            Sent as &ldquo;{subject}&rdquo;
            {replyNeeded ? " with reply requested." : "."}
          </p>
        </div>
        <div className="flex justify-end pb-2">
          <button type="button" className={levvyBtnSecondaryClass} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5 py-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          Select which client loop to send the notes to{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className={`w-full rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-sm text-slate-800 ${levvyFocusRingClass}`}
        >
          {clientOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Documents needed"
          className={`w-full rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-sm text-slate-800 ${levvyFocusRingClass}`}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          Assign a Tag
        </label>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className={`w-full rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-sm text-slate-800 ${levvyFocusRingClass}`}
        >
          {CLIENT_LOOP_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={10}
          placeholder="Type your message here..."
          className={`w-full resize-y rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 ${levvyFocusRingClass}`}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={replyNeeded}
          onClick={() => setReplyNeeded((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
            replyNeeded ? "bg-[#FF7A00]" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              replyNeeded ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-slate-800">Reply needed</span>
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 border-t border-[#E8EAED] pt-4 pb-2">
        <button type="button" className={levvyBtnSecondaryClass} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={levvyBtnPrimaryClass} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export function MessageClientModal({
  open,
  meetingTitle,
  defaultClient,
  clientOptions,
  notes,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E8EAED] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-client-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#E8EAED] px-5 py-4">
          <h2 id="message-client-title" className="text-lg font-bold text-slate-900">
            Message Client
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ComposeForm
            meetingTitle={meetingTitle}
            defaultClient={defaultClient}
            clientOptions={clientOptions}
            notes={notes}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
