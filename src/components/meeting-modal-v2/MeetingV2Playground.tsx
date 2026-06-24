"use client";

import { useState } from "react";
import { MeetingModalV2 } from "@/components/meeting-modal-v2/MeetingModalV2";
import {
  SAMPLE_MEETING_V2,
  SAMPLE_MONTHLY_CHECKIN,
  SAMPLE_NOTES_WITH_ACTION_ITEMS,
  SAMPLE_NOTES_WITH_CLIENT_ITEMS,
} from "@/components/meeting-modal-v2/sampleMeetingV2";
import type { MeetingV2 } from "@/components/meeting-modal-v2/types";

export function MeetingV2Playground() {
  const [open, setOpen] = useState(true);
  const [meeting, setMeeting] = useState<MeetingV2>(SAMPLE_MEETING_V2);
  const [withNotes, setWithNotes] = useState(false);

  const launch = (prefillNotes: boolean) => {
    setWithNotes(prefillNotes);
    const base = prefillNotes ? SAMPLE_MONTHLY_CHECKIN : SAMPLE_MEETING_V2;
    setMeeting({
      ...base,
      id: crypto.randomUUID(),
      notes: prefillNotes ? SAMPLE_NOTES_WITH_ACTION_ITEMS : "",
      savedTasks: [],
    });
    setOpen(true);
  };

  const launchClientItems = () => {
    setWithNotes(false);
    setMeeting({
      ...SAMPLE_MONTHLY_CHECKIN,
      id: crypto.randomUUID(),
      notes: SAMPLE_NOTES_WITH_CLIENT_ITEMS,
      savedTasks: [],
    });
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <span className="rounded-full bg-[#FFF4E6] px-3 py-1 text-xs font-bold text-[#FF7A00]">
          Meeting Modal V2 preview
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Bulk create ad hoc tasks from meeting notes
        </h1>
      </header>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => launch(false)}
          className="rounded-lg bg-[#FF7A00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#E66D00]"
        >
          Empty state with no meeting notes
        </button>
        <button
          type="button"
          onClick={() => launch(true)}
          className="rounded-lg border-2 border-[#FF7A00] bg-white px-4 py-2.5 text-sm font-bold text-[#FF7A00] hover:bg-[#FFF4E6]"
        >
          Meeting with action items contain only Levvy user names.
        </button>
        <button
          type="button"
          onClick={launchClientItems}
          className="rounded-lg border-2 border-[#FF7A00] bg-white px-4 py-2.5 text-sm font-bold text-[#FF7A00] hover:bg-[#FFF4E6]"
        >
          Meeting with action items contain both Levvy user and non-Levvy user name
        </button>
      </div>

      {withNotes && (
        <p className="mt-4 text-sm text-slate-500">
          Sample notes match the Variant B fixture — Generate tasks from notes
          yields 5 tasks for Maria (01:00 hrs, 1 day each).
        </p>
      )}

      <MeetingModalV2
        meeting={meeting}
        open={open}
        onClose={() => setOpen(false)}
        onMeetingChange={setMeeting}
      />
    </div>
  );
}
