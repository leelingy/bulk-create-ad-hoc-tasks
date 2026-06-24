import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Client, Workflow } from '../types';
import { appendMeetingLinkToNotes } from '../lib/meetingDeepLink';
import './Modal.css';

interface AddToWorkflowNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  client: Client | null;
  workflows: Workflow[];
  meetingId?: string;
  meetingTitle?: string;
  meetingDate?: string;
  meetingTime?: string;
  onSave: (notes: string, workflowId: string) => void;
}

const AddToWorkflowNotesModal: React.FC<AddToWorkflowNotesModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  client,
  workflows,
  meetingId,
  meetingTitle,
  meetingDate,
  meetingTime,
  onSave,
}) => {
  const [notes, setNotes] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [showWorkflowDropdown, setShowWorkflowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && selectedText) {
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
  }, [isOpen, selectedText, meetingId, meetingTitle, meetingDate, meetingTime]);

  useEffect(() => {
    if (!isOpen) {
      setNotes('');
      setSelectedWorkflow(null);
      setWorkflowSearch('');
      setShowWorkflowDropdown(false);
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

  const handleSave = () => {
    if (selectedWorkflow) {
      onSave(notes, selectedWorkflow.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add to Workflow Notes</h2>
        </div>

        <div className="modal-body">
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
                  ['clean']
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
        </div>

        <div className="modal-footer">
          <button className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button button-primary"
            onClick={handleSave}
            disabled={!selectedWorkflow}
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToWorkflowNotesModal;

