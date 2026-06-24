"use client";

import { SectionCard } from "./SectionCard";
import { CommentsBox } from "./CommentsBox";

type Props = {
  agendaHtml: string;
};

export function AgendaTab({ agendaHtml }: Props) {
  return (
    <div className="space-y-1">
      <SectionCard title="Agenda" showEdit onEdit={() => {}} editLabel="Edit agenda">
        {agendaHtml.trim() ? (
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: agendaHtml }}
          />
        ) : (
          <p className="text-sm text-slate-400">No agenda added yet.</p>
        )}
      </SectionCard>
      <CommentsBox />
    </div>
  );
}
