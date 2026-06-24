import React, { useEffect, useState } from "react";
import MeetingNotes from "./MeetingNotes";
import AddToWorkflowNotesModal from "./AddToWorkflowNotesModal";
import CreateTaskModal from "./CreateTaskModal";
import AINoteTaker from "./AINoteTaker";
import EmptyNotesSection from "./EmptyNotesSection";
import ManualNotesEditor from "./ManualNotesEditor";
import BulkActionItemsReview from "./BulkActionItemsReview";
import DistributeSummaryModal from "./DistributeSummaryModal";
import EditMeetingModal from "./EditMeetingModal";
import type { Client, CreatedTask, Meeting, TaskDraft, TenantUser, Workflow } from "../types";
import { extractActionItemsAsDrafts } from "../lib/taskDrafts";
import { appendMeetingLinkToNotes } from "../lib/meetingDeepLink";
import "./MeetingModal.css";

type Tab = "notes" | "tasks";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  clients: Client[];
  workflows: Workflow[];
  users: TenantUser[];
  onMeetingUpdate: (meeting: Meeting) => void;
  onTasksCreated: (tasks: CreatedTask[]) => void;
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  meeting,
  clients,
  workflows,
  users,
  onMeetingUpdate,
  onTasksCreated,
}) => {
  const [tab, setTab] = useState<Tab>("notes");
  const [notes, setNotes] = useState(meeting.summaryHtml);
  const [draftTasks, setDraftTasks] = useState<TaskDraft[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showWorkflowNotesModal, setShowWorkflowNotesModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAINoteTaker, setShowAINoteTaker] = useState(false);
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNotes(meeting.summaryHtml);
      setTab("notes");
      setParseError(null);
      setDraftTasks([]);
    }
  }, [isOpen, meeting.id]);

  useEffect(() => {
    if (tab === "tasks" && draftTasks.length > 0) {
      setDraftTasks((prev) =>
        prev.map((r) =>
          r.clientOverridden
            ? r
            : {
                ...r,
                clientId: meeting.client.id,
                clientName: meeting.client.name,
              },
        ),
      );
    }
  }, [meeting.client.id, meeting.client.name, tab]);

  const persistNotes = (html: string) => {
    setNotes(html);
    onMeetingUpdate({ ...meeting, summaryHtml: html });
  };

  const handleNotesUpdate = (newNotes: string) => {
    persistNotes(newNotes);
    setShowAINoteTaker(false);
    setShowManualEditor(false);
  };

  const handleGenerateTasks = () => {
    setParseError(null);
    const drafts = extractActionItemsAsDrafts(
      notes,
      meeting.client,
      workflows,
      meeting.title,
    );
    if (drafts.length === 0) {
      setParseError(
        'No action items found. Include an "Action items" section with bullet lines or assignee headers.',
      );
      return;
    }
    setDraftTasks(drafts);
    setTab("tasks");
  };

  const handleCreateBulkTasks = (rows: TaskDraft[]) => {
    const created: CreatedTask[] = rows.map((r) => ({
      ...r,
      meetingId: meeting.id,
      createdAt: new Date().toISOString(),
      notes: appendMeetingLinkToNotes(
        r.notes.trim().startsWith("<")
          ? r.notes
          : `<p>${r.notes}</p>`,
        meeting.id,
        meeting.title,
        meeting.date,
        meeting.time,
      ),
    }));
    if (created.length > 0) {
      onTasksCreated(created);
    }
    setParseError(null);
    setTab("notes");
    // Client action items aren't created as tasks — offer to share them.
    const hasClientItems = draftTasks.some((d) => d.audience === "client");
    if (hasClientItems) {
      setShowDistributeModal(true);
    }
  };

  const handleCreateSingleTask = (
    taskName: string,
    notesHtml: string,
    workflowId: string | null,
    budgetedHours: string,
    isHighPriority: boolean,
    assigneeId: string | null,
    assigneeName: string | null,
  ) => {
    const task: CreatedTask = {
      id: crypto.randomUUID(),
      taskName,
      notes: notesHtml,
      clientId: meeting.client.id,
      clientName: meeting.client.name,
      audience: "firm",
      assigneeId,
      assigneeName,
      workflowId,
      workflowName: workflowId
        ? workflows.find((w) => w.id === workflowId)?.name ?? null
        : null,
      budgetedHours,
      billType: "billable",
      isHighPriority,
      startDate: new Date().toISOString().split("T")[0],
      daysToComplete: "",
      instructions: "",
      requireApproval: false,
      sourceItemIds: [],
      meetingId: meeting.id,
      createdAt: new Date().toISOString(),
    };
    onTasksCreated([task]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content meeting-modal" onClick={(e) => e.stopPropagation()}>
          <div className="meeting-modal-header">
            <div className="meeting-header-left">
              <h2>{meeting.title}</h2>
              {meeting.date && meeting.time && (
                <div className="meeting-schedule">
                  {meeting.date} {meeting.time}
                </div>
              )}
              <div className="meeting-client">{meeting.client.name}</div>
            </div>
            <div className="meeting-modal-actions">
              <button
                type="button"
                className="icon-button"
                aria-label="Edit meeting"
                title="Edit meeting"
                onClick={() => setShowEditMeetingModal(true)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.333 2.00001C11.5084 1.82464 11.7163 1.68606 11.9447 1.59231C12.1731 1.49856 12.4173 1.45166 12.6637 1.45468C12.9101 1.4577 13.1533 1.51058 13.3792 1.61015C13.6051 1.70972 13.809 1.85385 13.9793 2.03418C14.1496 2.21451 14.2828 2.42749 14.3713 2.66012C14.4598 2.89275 14.5017 3.14043 14.4947 3.38879C14.4877 3.63715 14.4319 3.88135 14.3306 4.10725C14.2293 4.33315 14.0846 4.53618 13.9043 4.70468L6.528 12.081L2.66667 13.3333L3.919 9.47201L11.333 2.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button type="button" className="icon-button" onClick={onClose} aria-label="Close" title="Close">
                ✕
              </button>
            </div>
          </div>

          <div className="meeting-modal-tabs">
            <button
              type="button"
              className={`tab ${tab === "notes" ? "active" : ""}`}
              onClick={() => setTab("notes")}
            >
              Guests and Notes
            </button>
            <button
              type="button"
              className={`tab ${tab === "tasks" ? "active" : ""}`}
              onClick={() => setTab("tasks")}
            >
              Tasks{draftTasks.length > 0 ? ` (${draftTasks.length})` : ""}
            </button>
          </div>

          <div className="meeting-modal-body">
            {tab === "notes" && (
              <>
                <div className="meeting-section guests-section">
                  <h3>Guests · {meeting.guests.length}</h3>
                  <ul className="guests-list">
                    {meeting.guests.map((g) => (
                      <li key={`${g.email}-${g.name}`}>
                        {g.name}
                        {g.email && <span className="guest-email"> — {g.email}</span>}
                      </li>
                    ))}
                  </ul>
                  {notes.trim() && (
                    <button
                      type="button"
                      className="button button-secondary share-button"
                      onClick={() => setShowDistributeModal(true)}
                    >
                      Share with client
                    </button>
                  )}
                </div>

                <div className="meeting-section">
                  <div className="notes-header">
                    <h3>Notes</h3>
                    {notes && !showManualEditor && (
                      <div className="notes-actions">
                        <button
                          type="button"
                          className="icon-button-small"
                          aria-label="Edit notes"
                          title="Edit notes"
                          onClick={() => setShowManualEditor(true)}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.333 2.00001C11.5084 1.82464 11.7163 1.68606 11.9447 1.59231C12.1731 1.49856 12.4173 1.45166 12.6637 1.45468C12.9101 1.4577 13.1533 1.51058 13.3792 1.61015C13.6051 1.70972 13.809 1.85385 13.9793 2.03418C14.1496 2.21451 14.2828 2.42749 14.3713 2.66012C14.4598 2.89275 14.5017 3.14043 14.4947 3.38879C14.4877 3.63715 14.4319 3.88135 14.3306 4.10725C14.2293 4.33315 14.0846 4.53618 13.9043 4.70468L6.528 12.081L2.66667 13.3333L3.919 9.47201L11.333 2.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {!notes && !showManualEditor ? (
                    <EmptyNotesSection
                      onTakeNotesWithAI={() => setShowAINoteTaker(true)}
                      onTakeNotesManually={() => setShowManualEditor(true)}
                    />
                  ) : showManualEditor ? (
                    <ManualNotesEditor
                      initialNotes={notes}
                      onSave={handleNotesUpdate}
                      onCancel={() => setShowManualEditor(false)}
                    />
                  ) : (
                    <>
                      <MeetingNotes
                        notes={notes}
                        onAddToWorkflowNotes={(text) => {
                          setSelectedText(text);
                          setShowWorkflowNotesModal(true);
                        }}
                        onCreateAdHocTask={(text) => {
                          setSelectedText(text);
                          setShowCreateTaskModal(true);
                        }}
                      />
                      <div className="notes-cta-row">
                        <button
                          type="button"
                          className="button button-primary generate-tasks-button"
                          onClick={handleGenerateTasks}
                        >
                          Generate tasks from notes
                        </button>
                        {parseError && <span className="parse-error">{parseError}</span>}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {tab === "tasks" && (
              <BulkActionItemsReview
                rows={draftTasks}
                onChange={setDraftTasks}
                clients={clients}
                users={users}
                workflows={workflows}
                meetingTitle={meeting.title}
                onCreate={handleCreateBulkTasks}
                onCancel={() => setTab("notes")}
              />
            )}
          </div>
        </div>
      </div>

      <AddToWorkflowNotesModal
        isOpen={showWorkflowNotesModal}
        onClose={() => setShowWorkflowNotesModal(false)}
        selectedText={selectedText}
        client={meeting.client}
        workflows={workflows}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        meetingDate={meeting.date}
        meetingTime={meeting.time}
        onSave={(n, workflowId) => {
          console.log("Saving workflow notes:", { notes: n, workflowId });
        }}
      />

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        selectedText={selectedText}
        client={meeting.client}
        workflows={workflows}
        users={users}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        meetingDate={meeting.date}
        meetingTime={meeting.time}
        onCreate={handleCreateSingleTask}
      />

      <AINoteTaker
        isOpen={showAINoteTaker}
        onClose={() => setShowAINoteTaker(false)}
        meetingTitle={meeting.title}
        clientName={meeting.client.name}
        onSaveNotes={handleNotesUpdate}
      />

      <DistributeSummaryModal
        isOpen={showDistributeModal}
        onClose={() => setShowDistributeModal(false)}
        meeting={meeting}
        allClients={clients}
        clientActionItems={draftTasks.filter((d) => d.audience === "client")}
      />

      <EditMeetingModal
        isOpen={showEditMeetingModal}
        onClose={() => setShowEditMeetingModal(false)}
        meeting={meeting}
        clients={clients}
        onSave={onMeetingUpdate}
      />
    </>
  );
};

export default MeetingModal;
