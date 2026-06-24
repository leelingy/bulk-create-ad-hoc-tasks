"use client";

/**
 * Shared form-field primitives for the task-review redesign.
 *
 * These are intentionally self-contained (no dependency on the existing
 * BulkTaskDraftTable) so the redesign can live beside the current UI without
 * changing it. The visual language matches the Levvy modal tokens.
 */

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  MEETING_SUMMARY_LINE,
  notesEndWithMeetingSummary,
} from "@/lib/taskNotesMeetingLink";

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="text-[#FF7A00]">*</span>}
        {hint && (
          <span className="font-normal normal-case tracking-normal text-slate-400">
            · {hint}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-[#DEE2E6] bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

/**
 * Combobox: a searchable, free-text input with a suggestion dropdown.
 * Used for client, assignee, and workflow fields.
 */
export function Combobox({
  value,
  display,
  options,
  placeholder,
  disabled,
  invalid,
  emptyToNone,
  onPick,
  onType,
  onClear,
}: {
  /** Current committed text value (e.g. clientName). */
  value: string;
  /** Optional separate display string (e.g. assignee name when value is an id). */
  display?: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** When true, an empty value shows a "Not linked" affordance instead of error. */
  emptyToNone?: boolean;
  onPick: (option: string) => void;
  onType?: (text: string) => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const shown = open ? q : display ?? value;

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options.slice(0, 8);
    return options.filter((o) => o.toLowerCase().includes(needle));
  }, [q, options]);

  const hasValue = (display ?? value).trim().length > 0;

  return (
    <div className="relative">
      <input
        value={shown}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQ(display ?? value);
        }}
        onChange={(e) => {
          setQ(e.target.value);
          onType?.(e.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className={`${inputBase} ${hasValue ? "pr-8" : ""} ${
          invalid ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-300/60" : ""
        }`}
      />
      {hasValue && onClear && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onClear();
            setQ("");
          }}
          className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
      {open && !disabled && (
        <ul className="absolute z-30 mt-1 max-h-44 w-full min-w-[14rem] overflow-auto rounded-lg border border-[#DEE2E6] bg-white py-1 text-sm shadow-xl">
          {emptyToNone && (
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-slate-500 hover:bg-[#FFF4E6]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick("");
                  setQ("");
                  setOpen(false);
                }}
              >
                Not linked
              </button>
            </li>
          )}
          {suggestions.length === 0 && (
            <li className="px-3 py-1.5 text-slate-400">No matches</li>
          )}
          {suggestions.map((o) => (
            <li key={o}>
              <button
                type="button"
                className="flex w-full px-3 py-1.5 text-left text-slate-900 hover:bg-[#FFF4E6]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(o);
                  setQ(o);
                  setOpen(false);
                }}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Auto-growing notes textarea — the centerpiece of the redesign.
 * Grows with content up to a generous max, then scrolls.
 */
export function NotesTextarea({
  value,
  onChange,
  disabled,
  minRows = 5,
  placeholder,
  className = "",
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  minRows?: number;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoSize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 420)}px`;
  };

  return (
    <textarea
      ref={(el) => {
        ref.current = el;
        autoSize(el);
      }}
      value={value}
      disabled={disabled}
      rows={minRows}
      placeholder={placeholder}
      onChange={(e) => {
        onChange(e.target.value);
        autoSize(e.target);
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`w-full resize-y rounded-lg border border-[#DEE2E6] bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 ${className}`}
      style={{ minHeight: `${minRows * 1.6 + 1.25}rem` }}
    />
  );
}

const notesFieldClass =
  "w-full rounded-lg border border-[#DEE2E6] bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20";

/**
 * Task notes with an inline "View meeting summary" line (part of the notes text).
 * When blurred, that line renders as a hyperlink; when focused, the full text is editable.
 */
export function TaskNotesField({
  value,
  onChange,
  disabled,
  minRows = 5,
  placeholder,
  onViewMeetingSummary,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  minRows?: number;
  placeholder?: string;
  onViewMeetingSummary?: () => void;
}) {
  const [focused, setFocused] = useState(false);

  if (!onViewMeetingSummary || focused || disabled) {
    return (
      <NotesTextarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        minRows={minRows}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    );
  }

  const lines = value.split("\n");
  const hasSummaryLine = notesEndWithMeetingSummary(value);
  const bodyLines = hasSummaryLine ? lines.slice(0, -1) : lines;

  return (
    <div
      role="textbox"
      tabIndex={0}
      onClick={() => setFocused(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFocused(true);
        }
      }}
      className={`${notesFieldClass} min-h-[8rem] cursor-text whitespace-pre-wrap`}
      style={{ minHeight: `${minRows * 1.6 + 1.25}rem` }}
    >
      {!value.trim() && placeholder ? (
        <span className="text-slate-400">{placeholder}</span>
      ) : (
        <>
          {bodyLines.join("\n")}
          {hasSummaryLine && (
            <>
              {bodyLines.length > 0 ? "\n" : null}
              <button
                type="button"
                className="font-medium text-[#FF7A00] hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewMeetingSummary();
                }}
              >
                {MEETING_SUMMARY_LINE}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
