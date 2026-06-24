"use client";

import { useEffect, useState } from "react";
import type { Guest } from "./types";
import { isFirmAssignee } from "@/lib/actionItemAssignee";
import { SectionCard } from "./SectionCard";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";
import { levvyBtnOutlineSmClass, levvyBtnPrimaryClass } from "../workspace/levvyModalTokens";

type Props = {
  guests: Guest[];
  notes: string;
  editingNotes: boolean;
  parseError: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveNotes: (notes: string) => void;
  onGenerateTasks: (sourceNotes: string) => void;
  onSendViaClientLoop?: () => void;
};

function guestLabel(g: Guest): string | null {
  if (!isFirmAssignee(g.name)) return "[External]";
  return null;
}

export function GuestsAndNotesTab({
  guests,
  notes,
  editingNotes,
  parseError,
  onStartEdit,
  onCancelEdit,
  onSaveNotes,
  onGenerateTasks,
  onSendViaClientLoop,
}: Props) {
  const [guestsOpen, setGuestsOpen] = useState(true);
  const [draftNotes, setDraftNotes] = useState(notes);
  const effectiveNotes = editingNotes ? draftNotes : notes;
  const canGenerate = effectiveNotes.trim().length > 0;

  useEffect(() => {
    if (!editingNotes) setDraftNotes(notes);
  }, [notes, editingNotes]);

  const startEdit = () => {
    setDraftNotes(notes);
    onStartEdit();
  };

  const saveNotes = () => {
    onSaveNotes(draftNotes);
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-[#E8EAED] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setGuestsOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <h3 className="text-sm font-semibold text-slate-800">
            Guests · {guests.length} members
          </h3>
          {guestsOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-slate-400" />
          )}
        </button>
        {guestsOpen && (
          <ul className="space-y-3 border-t border-[#F1F3F4] px-4 py-3">
            {guests.map((g) => {
              const label = guestLabel(g);
              return (
              <li key={g.name} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5D0B5] text-xs font-bold text-slate-700">
                  {g.initials}
                </span>
                <span className="text-sm text-slate-800">
                  {g.name}
                  {label && (
                    <span className="text-slate-500"> {label}</span>
                  )}
                </span>
              </li>
              );
            })}
          </ul>
        )}
      </section>

      <SectionCard
        title="Notes"
        showEdit={!editingNotes}
        onEdit={startEdit}
        editLabel="Edit notes"
      >
        {editingNotes ? (
          <div className="space-y-3">
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              rows={10}
              className="w-full resize-y rounded-lg border border-[#E8EAED] bg-white p-3 text-sm leading-relaxed text-slate-800 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20"
              placeholder="Type or paste your meeting summary here. Include an Action items section with bullet lines."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNotes}
                className="rounded-lg bg-[#FF7A00] px-4 py-2 text-sm font-bold text-white hover:bg-[#E66D00]"
              >
                Save
              </button>
            </div>
          </div>
        ) : !notes.trim() && !editingNotes ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="max-w-sm text-sm font-medium text-slate-700">
              Turn meeting notes into ad hoc tasks automatically
            </p>
            <button
              type="button"
              onClick={startEdit}
              className="mt-4 rounded-lg border-2 border-[#FF7A00] bg-white px-4 py-2 text-sm font-bold text-[#FF7A00] hover:bg-[#FFF4E6]"
            >
              Paste summary or take notes
            </button>
          </div>
        ) : (
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {notes}
          </pre>
        )}
      </SectionCard>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={() => onGenerateTasks(effectiveNotes)}
          title={canGenerate ? undefined : "Add notes first"}
          className={`${levvyBtnPrimaryClass} disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:bg-slate-300`}
        >
          Generate tasks from notes
        </button>
        {onSendViaClientLoop && (
          <button
            type="button"
            className={`${levvyBtnOutlineSmClass} py-2.5`}
            onClick={onSendViaClientLoop}
          >
            Send via Client Loop
          </button>
        )}
        {parseError && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {parseError}
          </p>
        )}
      </div>
    </div>
  );
}
