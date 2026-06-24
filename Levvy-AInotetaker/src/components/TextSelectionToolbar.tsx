import React from 'react';
import './TextSelectionToolbar.css';

interface TextSelectionToolbarProps {
  position: { top: number; left: number };
  onAddToWorkflowNotes: () => void;
  onCreateAdHocTask: () => void;
}

const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({
  position,
  onAddToWorkflowNotes,
  onCreateAdHocTask,
}) => {
  return (
    <div
      className="text-selection-toolbar"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        className="toolbar-button workflow-notes-button"
        onClick={onAddToWorkflowNotes}
      >
        Add to Workflow Notes
      </button>
      <button
        className="toolbar-button ad-hoc-task-button"
        onClick={onCreateAdHocTask}
      >
        Create Ad Hoc Task
      </button>
    </div>
  );
};

export default TextSelectionToolbar;

