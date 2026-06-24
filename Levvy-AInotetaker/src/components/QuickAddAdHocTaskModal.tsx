import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Client, Workflow } from '../types';
import './Modal.css';

interface QuickAddAdHocTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  workflows: Workflow[];
  onCreate: (taskData: {
    taskName: string;
    notes: string;
    workflowId: string;
    budgetedHours: string;
    billType: 'billable' | 'non-billable';
    isHighPriority: boolean;
    assignee?: string;
    startDate?: string;
    daysToComplete?: string;
    requireApproval: boolean;
    instructions: string;
  }) => void;
}

const QuickAddAdHocTaskModal: React.FC<QuickAddAdHocTaskModalProps> = ({
  isOpen,
  onClose,
  client,
  workflows,
  onCreate,
}) => {
  const [taskType, setTaskType] = useState<'ad-hoc' | 'meeting'>('ad-hoc');
  const [taskName, setTaskName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [showWorkflowDropdown, setShowWorkflowDropdown] = useState(false);
  const [billType, setBillType] = useState<'billable' | 'non-billable'>('billable');
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [budgetedHours, setBudgetedHours] = useState('01:00');
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [daysToComplete, setDaysToComplete] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);
  const [instructions, setInstructions] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setTaskName('');
      setNotes('');
      setSelectedWorkflow(null);
      setWorkflowSearch('');
      setShowWorkflowDropdown(false);
      setBillType('billable');
      setIsHighPriority(false);
      setAssignee('');
      setBudgetedHours('01:00');
      setShowMoreFields(false);
      const today = new Date();
      setStartDate(today.toISOString().split('T')[0]);
      setDaysToComplete('');
      setRequireApproval(false);
      setInstructions('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowWorkflowDropdown(false);
      }
    };

    if (showWorkflowDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWorkflowDropdown]);

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(workflowSearch.toLowerCase())
  );

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowSearch(workflow.name);
    setShowWorkflowDropdown(false);
  };

  const handleCreate = () => {
    if (taskName.trim() && selectedWorkflow && client) {
      onCreate({
        taskName: taskName.trim(),
        notes,
        workflowId: selectedWorkflow.id,
        budgetedHours,
        billType,
        isHighPriority,
        assignee: assignee.trim() || undefined,
        startDate: startDate || undefined,
        daysToComplete: daysToComplete || undefined,
        requireApproval,
        instructions,
      });
      onClose();
    }
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
              className={`task-type-button ${taskType === 'ad-hoc' ? 'active' : ''}`}
              onClick={() => setTaskType('ad-hoc')}
            >
              Ad hoc Task
            </button>
            <button
              className={`task-type-button ${taskType === 'meeting' ? 'active' : ''}`}
              onClick={() => setTaskType('meeting')}
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
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'align': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
            />
          </div>

          <div className="form-field">
            <label>
              Bill Type <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="billType"
                  value="billable"
                  checked={billType === 'billable'}
                  onChange={(e) => setBillType(e.target.value as 'billable' | 'non-billable')}
                />
                Billable
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="billType"
                  value="non-billable"
                  checked={billType === 'non-billable'}
                  onChange={(e) => setBillType(e.target.value as 'billable' | 'non-billable')}
                />
                Non-Billable
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>
              Client <span className="required">*</span>
            </label>
            <input
              type="text"
              value={client?.name || ''}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-field">
            <label>Workflows</label>
            <div className="dropdown-container" ref={dropdownRef}>
              <input
                type="text"
                value={workflowSearch}
                onChange={(e) => {
                  setWorkflowSearch(e.target.value);
                  setShowWorkflowDropdown(true);
                }}
                onFocus={() => setShowWorkflowDropdown(true)}
                placeholder="Search workflows..."
                className="dropdown-input"
              />
              {showWorkflowDropdown && filteredWorkflows.length > 0 && (
                <div className="dropdown-list">
                  {filteredWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`dropdown-item ${
                        selectedWorkflow?.id === workflow.id ? 'selected' : ''
                      }`}
                      onClick={() => handleWorkflowSelect(workflow)}
                    >
                      {workflow.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-field">
            <label>Assignee</label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter assignee name"
            />
          </div>

          {showMoreFields && (
            <>
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
                  min="0"
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
                <label>Instructions</label>
                <ReactQuill
                  theme="snow"
                  value={instructions}
                  onChange={setInstructions}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'align': [] }],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {!showMoreFields && (
            <div className="more-cta-container">
              <button 
                className="more-cta-button"
                onClick={() => setShowMoreFields(!showMoreFields)}
              >
                Edit Scheduling & Budget
              </button>
            </div>
          )}
          <div className="footer-buttons">
            <button className="button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={handleCreate}
              disabled={!taskName.trim() || !selectedWorkflow || !client}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddAdHocTaskModal;
