import React, { useMemo, useState } from "react";
import type { Client, TaskDraft, TenantUser, Workflow } from "../types";
import { refreshDraftSuggestions } from "../lib/applySuggestions";
import { mergeTaskDrafts } from "../lib/taskDrafts";
import {
  TaskNameSuggestionTags,
  WorkflowSuggestionTags,
} from "./SuggestionTags";
import "./BulkActionItemsReview.css";
import "./Modal.css";
import "./SuggestionTags.css";

type Props = {
  rows: TaskDraft[];
  onChange: (rows: TaskDraft[]) => void;
  clients: Client[];
  users: TenantUser[];
  workflows: Workflow[];
  meetingTitle: string;
  onCreate: (rows: TaskDraft[]) => void;
  onCancel: () => void;
};

function TypeaheadCell<T extends { id: string; name: string }>({
  value,
  displayValue,
  options,
  placeholder,
  allowEmpty,
  emptyLabel,
  onSelect,
}: {
  value: string | null;
  displayValue: string;
  options: T[];
  placeholder: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  onSelect: (item: T | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(displayValue);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options.slice(0, 8);
    return options.filter((o) => o.name.toLowerCase().includes(needle));
  }, [q, options]);

  return (
    <div className="bulk-typeahead-wrap">
      <input
        type="text"
        value={open ? q : displayValue}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQ(displayValue);
        }}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="bulk-typeahead-dropdown">
          {allowEmpty && (
            <div
              className={`bulk-typeahead-item ${!value ? "selected" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              {emptyLabel ?? "None"}
            </div>
          )}
          {filtered.map((o) => (
            <div
              key={o.id}
              className={`bulk-typeahead-item ${value === o.id ? "selected" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(o);
                setOpen(false);
              }}
            >
              {o.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const BulkActionItemsReview: React.FC<Props> = ({
  rows,
  onChange,
  clients,
  users,
  workflows,
  meetingTitle,
  onCreate,
  onCancel,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [primaryId, setPrimaryId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const firmRows = useMemo(
    () => rows.filter((r) => r.audience !== "client"),
    [rows],
  );
  const clientRows = useMemo(
    () => rows.filter((r) => r.audience === "client"),
    [rows],
  );

  const updateRow = (id: string, patch: Partial<TaskDraft>) => {
    onChange(
      rows.map((r) => {
        if (r.id !== id) return r;
        return refreshDraftSuggestions(r, clients, workflows, meetingTitle, patch);
      }),
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === firmRows.length && firmRows.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(firmRows.map((r) => r.id)));
    }
  };

  const moveToClient = (id: string) => {
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    updateRow(id, { audience: "client", assigneeAmbiguous: false });
  };

  const moveToFirm = (id: string) =>
    updateRow(id, { audience: "firm", assigneeAmbiguous: false });

  const confirmFirm = (id: string) => updateRow(id, { assigneeAmbiguous: false });

  const handleMerge = () => {
    if (selectedIds.size < 2) return;
    const primary = primaryId || [...selectedIds][0];
    const primaryRow = rows.find((r) => r.id === primary);
    const client =
      clients.find((c) => c.id === primaryRow?.clientId) ?? clients[0];
    onChange(
      mergeTaskDrafts(
        rows,
        selectedIds,
        primary,
        client,
        workflows,
        meetingTitle,
      ),
    );
    setSelectedIds(new Set());
    setPrimaryId("");
  };

  const handleCreate = () => {
    const valid = firmRows.filter((r) => r.taskName.trim());
    if (valid.length === 0 && clientRows.length === 0) {
      setError("Add at least one task with a name.");
      return;
    }
    setError(null);
    onCreate(valid);
  };

  const activatedWorkflowsForClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return workflows;
    const ids = new Set(client.activatedWorkflowIds ?? []);
    return workflows.filter((w) => ids.has(w.id));
  };

  const selectedList = [...selectedIds];

  if (rows.length === 0) {
    return (
      <div className="bulk-review">
        <p className="bulk-empty">No action items found in the meeting notes.</p>
        <div className="bulk-review-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bulk-review">
      {selectedIds.size >= 2 && (
        <div className="bulk-review-toolbar">
          <div className="bulk-review-toolbar-left">
            <span className="bulk-review-selected">
              {selectedIds.size} rows selected
            </span>
            <label>
              Primary row:{" "}
              <select
                className="bulk-merge-select"
                value={primaryId || selectedList[0]}
                onChange={(e) => setPrimaryId(e.target.value)}
              >
                {rows
                  .filter((r) => selectedIds.has(r.id))
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      Row {rows.indexOf(r) + 1}: {r.taskName.slice(0, 40) || "(empty)"}
                    </option>
                  ))}
              </select>
            </label>
            <button type="button" className="button button-secondary" onClick={handleMerge}>
              Merge into 1 task
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      <div className="bulk-section-heading">
        <h3>Firm tasks ({firmRows.length})</h3>
        <span className="bulk-section-sub">
          Assigned to Levvy users. These are created as ad hoc tasks.
        </span>
      </div>

      {firmRows.length === 0 ? (
        <p className="bulk-empty-firm">
          No action items matched a Levvy user. All items below will be shared
          with the client.
        </p>
      ) : (
      <div className="bulk-review-table-wrap">
        <table className="bulk-review-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === firmRows.length && firmRows.length > 0
                  }
                  onChange={toggleAll}
                  aria-label="Select all rows"
                />
              </th>
              <th>#</th>
              <th>Task name</th>
              <th>Notes</th>
              <th>Client</th>
              <th>Assignee</th>
              <th>Workflow</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {firmRows.map((r, idx) => (
              <tr key={r.id} className={r.assigneeAmbiguous ? "row-ambiguous" : ""}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    aria-label={`Select row ${idx + 1}`}
                  />
                </td>
                <td>{idx + 1}</td>
                <td>
                  <div className="field-with-suggestions">
                    <textarea
                      value={r.taskName}
                      onChange={(e) =>
                        updateRow(r.id, {
                          taskName: e.target.value,
                          taskNameOverridden: true,
                        })
                      }
                      rows={2}
                    />
                    <TaskNameSuggestionTags
                      suggestedName={r.suggestedTaskName}
                      genericName={r.genericTaskName}
                      dismissed={!!r.taskNameSuggestionDismissed}
                      onApplySuggested={() =>
                        updateRow(r.id, {
                          taskName: r.suggestedTaskName ?? "",
                          taskNameOverridden: false,
                        })
                      }
                      onDismissSuggested={() =>
                        updateRow(r.id, {
                          taskNameSuggestionDismissed: true,
                          taskName:
                            r.taskName === r.suggestedTaskName ? "" : r.taskName,
                        })
                      }
                      onApplyGeneric={() =>
                        updateRow(r.id, {
                          taskName: r.genericTaskName ?? "",
                          taskNameOverridden: true,
                          taskNameSuggestionDismissed: true,
                        })
                      }
                    />
                  </div>
                </td>
                <td>
                  <textarea
                    value={r.notes}
                    onChange={(e) =>
                      updateRow(r.id, {
                        notes: e.target.value,
                        taskNameOverridden: r.taskNameOverridden,
                        workflowOverridden: r.workflowOverridden,
                      })
                    }
                    rows={2}
                  />
                </td>
                <td>
                  <TypeaheadCell
                    value={r.clientId}
                    displayValue={r.clientName}
                    options={clients}
                    placeholder="Client"
                    onSelect={(c) =>
                      updateRow(r.id, {
                        clientId: c?.id ?? "",
                        clientName: c?.name ?? "",
                        clientOverridden: true,
                        workflowOverridden: false,
                      })
                    }
                  />
                </td>
                <td>
                  <TypeaheadCell
                    value={r.assigneeId}
                    displayValue={r.assigneeName ?? ""}
                    options={users}
                    placeholder="Assignee"
                    allowEmpty
                    emptyLabel="Unassigned"
                    onSelect={(u) =>
                      updateRow(r.id, {
                        assigneeId: u?.id ?? null,
                        assigneeName: u?.name ?? null,
                      })
                    }
                  />
                  {r.assigneeAmbiguous ? (
                    <div className="assignee-ambiguous">
                      <span className="assignee-ambiguous-text">
                        “{r.assigneeName}” matches both a Levvy user and a
                        contact on {r.clientName}. Who is this for?
                      </span>
                      <div className="assignee-ambiguous-actions">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => confirmFirm(r.id)}
                        >
                          Keep as firm task
                        </button>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => moveToClient(r.id)}
                        >
                          For the client
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="link-button move-to-client"
                      onClick={() => moveToClient(r.id)}
                    >
                      For the client →
                    </button>
                  )}
                </td>
                <td>
                  <div className="field-with-suggestions">
                    <TypeaheadCell
                      value={r.workflowId}
                      displayValue={r.workflowName ?? ""}
                      options={activatedWorkflowsForClient(r.clientId)}
                      placeholder="Workflow"
                      allowEmpty
                      emptyLabel="Not linked"
                      onSelect={(w) =>
                        updateRow(r.id, {
                          workflowId: w?.id ?? null,
                          workflowName: w?.name ?? null,
                          workflowOverridden: true,
                        })
                      }
                    />
                    <WorkflowSuggestionTags
                      suggestedName={r.suggestedWorkflowName}
                      dismissed={!!r.workflowSuggestionDismissed}
                      onApply={() =>
                        updateRow(r.id, {
                          workflowId: r.suggestedWorkflowId ?? null,
                          workflowName: r.suggestedWorkflowName ?? null,
                          workflowOverridden: false,
                        })
                      }
                      onDismiss={() =>
                        updateRow(r.id, {
                          workflowSuggestionDismissed: true,
                          workflowId:
                            r.workflowId === r.suggestedWorkflowId
                              ? null
                              : r.workflowId,
                          workflowName:
                            r.workflowId === r.suggestedWorkflowId
                              ? null
                              : r.workflowName,
                        })
                      }
                    />
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    value={r.budgetedHours}
                    onChange={(e) =>
                      updateRow(r.id, { budgetedHours: e.target.value })
                    }
                    placeholder="01:00"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <div className="bulk-section-heading client-heading">
        <h3>Action items for the client ({clientRows.length})</h3>
        <span className="bulk-section-sub">
          These didn&apos;t match a Levvy user, so they&apos;re treated as client
          action items. Share them with the meeting summary instead of creating
          internal tasks.
        </span>
      </div>

      {clientRows.length === 0 ? (
        <p className="bulk-empty-client">
          No client action items. Use “For the client” on a row above to move one
          here.
        </p>
      ) : (
        <div className="client-items-list">
          {clientRows.map((r) => (
            <div key={r.id} className="client-item">
              <div className="client-item-main">
                <textarea
                  value={r.notes}
                  onChange={(e) => updateRow(r.id, { notes: e.target.value })}
                  rows={2}
                  aria-label="Client action item"
                />
                <div className="client-item-meta">
                  Recipient:{" "}
                  <strong>{r.assigneeName || r.clientName}</strong>
                  {r.assigneeName ? ` · ${r.clientName}` : ""}
                </div>
              </div>
              <button
                type="button"
                className="link-button"
                onClick={() => moveToFirm(r.id)}
              >
                Make a firm task
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="bulk-error">{error}</p>}

      <div className="bulk-review-actions">
        <button type="button" className="button button-secondary" onClick={onCancel}>
          Back to notes
        </button>
        <div className="bulk-review-actions-right">
          {clientRows.length > 0 && (
            <span className="bulk-client-hint">
              {clientRows.length} action item
              {clientRows.length !== 1 ? "s" : ""} will be shared with the client.
            </span>
          )}
          <button type="button" className="button button-primary" onClick={handleCreate}>
            Create {firmRows.filter((r) => r.taskName.trim()).length} task
            {firmRows.filter((r) => r.taskName.trim()).length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionItemsReview;
