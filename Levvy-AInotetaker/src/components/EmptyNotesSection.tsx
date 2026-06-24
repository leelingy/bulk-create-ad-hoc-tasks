import React from 'react';
import './EmptyNotesSection.css';

interface EmptyNotesSectionProps {
  onTakeNotesWithAI: () => void;
  onTakeNotesManually: () => void;
}

const EmptyNotesSection: React.FC<EmptyNotesSectionProps> = ({
  onTakeNotesWithAI,
  onTakeNotesManually,
}) => {
  return (
    <div className="empty-notes-section">
      <div className="empty-notes-content">
        <p className="empty-notes-text">No notes yet. Start taking notes to capture meeting details.</p>
        <div className="empty-notes-ctas">
          <button className="cta-button cta-ai" onClick={onTakeNotesWithAI}>
            Take notes with AI
          </button>
          <button className="cta-button cta-manual" onClick={onTakeNotesManually}>
            Take notes manually
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyNotesSection;

