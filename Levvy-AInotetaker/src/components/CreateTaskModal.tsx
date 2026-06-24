import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import type { Client, TenantUser, Workflow } from "../types";
import { appendMeetingLinkToNotes } from "../lib/meetingDeepLink";
import {
  genericMeetingTaskName,
  suggestTaskNameFromNotes,
} from "../lib/suggestTaskName";
import {
  getActivatedWorkflows,
  suggestWorkflowFromNotes,
} from "../lib/suggestWorkflow";
import {
  TaskNameSuggestionTags,
  WorkflowSuggestionTags,
} from "./SuggestionTags";
import "./Modal.css";
import "./SuggestionTags.css";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  client: Client;
  workflows: Workflow[];
  users: TenantUser[];
  meetingId?: string;
  meetingTitle?: string;
  meetingDate?: string;
  meetingTime?: string;
  onCreate: (
    taskName: string,
    notes: string,
    workflowId: string | null,
    budgetedHours: string,
    isHighPriority: boolean,
    assigneeId: string | null,
    assigneeName: string | null,
  ) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  client,
  workflows,
  users,
  meetingId,
  meetingTitle,
  meetingDate,
  meetingTime,
  onCreate,
}) => {
  const [taskType, setTaskType] = useState<"ad-hoc" | "meeting">("ad-hoc");
  const [taskName, setTaskName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowSearch, setWorkflowSearch] = useState("");
  const [showWorkflowDropdown, setShowWorkflowDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<TenantUser | null>(null);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [budgetedHours, setBudgetedHours] = useState("01:00");
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().split("T")[0],
  );
  const [daysToComplete, setDaysToComplete] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [suggestedTaskName, setSuggestedTaskName] = useState<string | null>(null);
  const [suggestedWorkflowName, setSuggestedWorkflowName] = useState<string | null>(null);
  const [suggestedWorkflowId, setSuggestedWorkflowId] = useState<string | null>(null);
  const [taskNameSuggestionDismissed, setTaskNameSuggestionDismissed] = useState(false);
  const [workflowSuggestionDismissed, setWorkflowSuggestionDismissed] = useState(false);
  const workflowRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && selectedText) {
      const suggestedName = suggestTaskNameFromNotes(selectedText);
      const suggestedWf = suggestWorkflowFromNotes(
        selectedText,
        client,
        workflows,
      );
      setSuggestedTaskName(suggestedName);
      setSuggestedWorkflowName(suggestedWf?.name ?? null);
      setSuggestedWorkflowId(suggestedWf?.id ?? null);
      setTaskNameSuggestionDismissed(false);
      setWorkflowSuggestionDismissed(false);
      setTaskName(suggestedName);
      setSelectedWorkflow(suggestedWf);
      setWorkflowSearch(suggestedWf?.name ?? "");
      const wrappedText = selectedText.trim().startsWith("<")
        ? selectedText
        : `<p>${selectedText}</p>`;
      const withLink = meetingId
        ? appendMeetingLinkToNotes(
            wrappedText,
            meetingId,
            meetingTitle,
            meetingDate,
            meetingTime,
          )
        : wrappedText;
      setNotes(withLink);
    }
  }, [isOpen, selectedText, meetingId, meetingTitle, meetingDate, meetingTime, client, workflows]);

  useEffect(() => {
    if (!isOpen) {
      setTaskName("");
      setNotes("");
      setSelectedWorkflow(null);
      setWorkflowSearch("");
      setShowWorkflowDropdown(false);
      setSelectedAssignee(null);
      setAssigneeSearch("");
      setShowAssigneeDropdown(false);
      setBudgetedHours("01:00");
      setIsHighPriority(false);
      setShowMoreFields(false);
      setStartDate(new Date().toISOString().split("T")[0]);
      setDaysToComplete("");
      setRequireApproval(false);
      setInstructions("");
      setSuggestedTaskName(null);
      setSuggestedWorkflowName(null);
      setSuggestedWorkflowId(null);
      setTaskNameSuggestionDismissed(false);
      setWorkflowSuggestionDismissed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workflowRef.current && !workflowRef.current.contains(event.target as Node)) {
        setShowWorkflowDropdown(false);
      }
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activatedWorkflows = getActivatedWorkflows(client, workflows);

  const filteredWorkflows = activatedWorkflows.filter((w) =>
    w.name.toLowerCase().includes(workflowSearch.toLowerCase()),
  );

  const genericTaskName = meetingTitle
    ? genericMeetingTaskName(meetingTitle)
    : null;

  const filteredAssignees = users.filter(
    (u) =>
      u.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(assigneeSearch.toLowerCase()),
  );

  const handleCreate = () => {
    if (!taskName.trim()) return;
    onCreate(
      taskName.trim(),
      notes,
      selectedWorkflow?.id ?? null,
      budgetedHours,
      isHighPriority,
      selectedAssignee?.id ?? null,
      selectedAssignee?.name ?? null,
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Task</h2>
        </div>

        <div className="modal-body">
          <div className="task-type-selector">
            <button
              type="button"
              className={`task-type-button ${taskType === "ad-hoc" ? "active" : ""}`}
              onClick={() => setTaskType("ad-hoc")}
            >
              Ad hoc Task
            </button>
            <button
              type="button"
              className={`task-type-button ${taskType === "meeting" ? "active" : ""}`}
              onClick={() => setTaskType("meeting")}
            >
              Meeting
            </button>
          </div>

          <div className="form-field">
            <label>
              Task <span className="required">*</span>
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
            />
            <TaskNameSuggestionTags
              suggestedName={suggestedTaskName}
              genericName={genericTaskName}
              dismissed={taskNameSuggestionDismissed}
              onApplySuggested={() => {
                if (suggestedTaskName) setTaskName(suggestedTaskName);
              }}
              onDismissSuggested={() => {
                setTaskNameSuggestionDismissed(true);
                if (taskName === suggestedTaskName) setTaskName("");
              }}
              onApplyGeneric={() => {
                if (genericTaskName) {
                  setTaskName(genericTaskName);
                  setTaskNameSuggestionDismissed(true);
                }
              }}
            />
          </div>

          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={isHighPriority}
                onChange={(e) => setIsHighPriority(e.target.checked)}
              />
              Set as High Priority
            </label>
          </div>

          <div className="form-field">
            <label>Notes</label>
            <ReactQuill
              theme="snow"
              value={notes}
              onChange={setNotes}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ color: [] }, { background: [] }],
                  [{ align: [] }],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["clean"],
                ],
              }}
            />
          </div>

          <div className="form-field">
            <label>
              Client <span className="required">*</span>
            </label>
            <input
              type="text"
              value={client.name}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-field">
            <label>Assignee</label>
            <div className="dropdown-container" ref={assigneeRef}>
              <input
                type="text"
                value={assigneeSearch}
                onChange={(e) => {
                  setAssigneeSearch(e.target.value);
                  setShowAssigneeDropdown(true);
                }}
                onFocus={() => setShowAssigneeDropdown(true)}
                placeholder="Search assignees..."
                className="dropdown-input"
              />
              {showAssigneeDropdown && (
                <div className="dropdown-list">
                  <div
                    className="dropdown-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedAssignee(null);
                      setAssigneeSearch("");
                      setShowAssigneeDropdown(false);
                    }}
                  >
                    Unassigned
                  </div>
                  {filteredAssignees.map((u) => (
                    <div
                      key={u.id}
                      className={`dropdown-item ${selectedAssignee?.id === u.id ? "selected" : ""}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedAssignee(u);
                        setAssigneeSearch(u.name);
                        setShowAssigneeDropdown(false);
                      }}
                    >
                      {u.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-field">
            <label>Workflows (optional)</label>
            <div className="dropdown-container" ref={workflowRef}>
              <input
                type="text"
                value={workflowSearch}
                onChange={(e) => {
                  setWorkflowSearch(e.target.value);
                  setShowWorkflowDropdown(true);
                }}
                onFocus={() => setShowWorkflowDropdown(true)}
                placeholder="Search workflows or leave empty..."
                className="dropdown-input"
              />
              {showWorkflowDropdown && (
                <div className="dropdown-list">
                  <div
                    className="dropdown-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedWorkflow(null);
                      setWorkflowSearch("");
                      setShowWorkflowDropdown(false);
                      setWorkflowSuggestionDismissed(true);
                    }}
                  >
                    Not linked
                  </div>
                  {filteredWorkflows.map((w) => (
                    <div
                      key={w.id}
                      className={`dropdown-item ${selectedWorkflow?.id === w.id ? "selected" : ""}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedWorkflow(w);
                        setWorkflowSearch(w.name);
                        setShowWorkflowDropdown(false);
                        setWorkflowSuggestionDismissed(true);
                      }}
                    >
                      {w.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <WorkflowSuggestionTags
              suggestedName={suggestedWorkflowName}
              dismissed={workflowSuggestionDismissed}
              onApply={() => {
                if (suggestedWorkflowId && suggestedWorkflowName) {
                  const wf = activatedWorkflows.find(
                    (w) => w.id === suggestedWorkflowId,
                  );
                  if (wf) {
                    setSelectedWorkflow(wf);
                    setWorkflowSearch(wf.name);
                  }
                }
              }}
              onDismiss={() => {
                setWorkflowSuggestionDismissed(true);
                if (selectedWorkflow?.id === suggestedWorkflowId) {
                  setSelectedWorkflow(null);
                  setWorkflowSearch("");
                }
              }}
            />
          </div>

          {showMoreFields && (
            <>
              <div className="form-field">
                <label>
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Days to complete</label>
                <input
                  type="number"
                  value={daysToComplete}
                  onChange={(e) => setDaysToComplete(e.target.value)}
                  placeholder="Enter number of days"
                  min={0}
                />
              </div>

              <div className="form-field">
                <label>
                  Budgeted Hours <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={budgetedHours}
                  onChange={(e) => setBudgetedHours(e.target.value)}
                  placeholder="01:00"
                />
              </div>

              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                  />
                  Require Approval
                </label>
              </div>

              <div className="form-field">
                <label>Instructions</label>
                <ReactQuill
                  theme="snow"
                  value={instructions}
                  onChange={setInstructions}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ color: [] }, { background: [] }],
                      [{ align: [] }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["clean"],
                    ],
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <div className="more-cta-container">
            <button
              type="button"
              className="more-cta-button"
              onClick={() => setShowMoreFields(!showMoreFields)}
            >
              {showMoreFields ? "Less" : "More"}
            </button>
          </div>
          <div className="footer-buttons">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={handleCreate}
              disabled={!taskName.trim()}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
