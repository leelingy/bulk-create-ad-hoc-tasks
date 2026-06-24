"use client";

import { useState } from "react";
import { CLIENTS, type ClientName } from "@/lib/tenantUsers";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    clientName: ClientName;
    dayIndex: number;
    startLabel: string;
    endLabel: string;
  }) => void;
};

const DAYS = [
  { idx: 0, label: "Mon, Mar 23" },
  { idx: 1, label: "Tue, Mar 24" },
  { idx: 2, label: "Wed, Mar 25" },
  { idx: 3, label: "Thu, Mar 26" },
  { idx: 4, label: "Fri, Mar 27" },
];

export function CreateMeetingDialog({ open, onCreate, onClose }: Props) {
  const [title, setTitle] = useState("New meeting");
  const [clientName, setClientName] = useState<ClientName>(CLIENTS[0]);
  const [dayIndex, setDayIndex] = useState(2);
  const [startLabel, setStartLabel] = useState("09:00 am");
  const [endLabel, setEndLabel] = useState("10:00 am");

  if (!open) return null;

  const submit = () => {
    onCreate({ title, clientName, dayIndex, startLabel, endLabel });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">New meeting</h3>
        <p className="mt-1 text-sm text-slate-600">
          Meetings appear in the top “Meeting And My Tasks” lane so you can open
          them, paste notes, and try the LLM.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Client
            <select
              value={clientName}
              onChange={(e) =>
                setClientName(e.target.value as ClientName)
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {CLIENTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Day
            <select
              value={dayIndex}
              onChange={(e) => setDayIndex(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {DAYS.map((d) => (
                <option key={d.idx} value={d.idx}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm font-medium text-slate-700">
              Start
              <input
                value={startLabel}
                onChange={(e) => setStartLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              End
              <input
                value={endLabel}
                onChange={(e) => setEndLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#F1F3F5] px-4 py-2 text-sm font-bold text-slate-900 shadow-sm hover:bg-[#E9ECEF]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-[#FF7A00] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#E66D00]"
          >
            Add meeting
          </button>
        </div>
      </div>
    </div>
  );
}
