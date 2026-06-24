import React, { useState } from 'react';
import './AINoteTaker.css';

interface AINoteTakerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingTitle: string;
  clientName?: string;
  onSaveNotes: (notes: string) => void;
}

const AINoteTaker: React.FC<AINoteTakerProps> = ({
  isOpen,
  onClose,
  meetingTitle,
  clientName,
  onSaveNotes,
}) => {
  const [recap, setRecap] = useState('');

  const handleGenerateNotes = () => {
    // Sample AI-generated notes - in a real app, this would call an AI API
    const generatedNotes = `Tools, Systems & Integrations

Client uses Stripe, PayPal, Shopify, and ACH transfers for revenue collection.

They manage expenses using Ramp but have not fully activated the receipt-capture workflow.

Internal reporting is currently done in Google Sheets using a template that the finance lead updates manually.

Payroll is run through Gusto, but contractor payments are split between Gusto and direct bank transfers.

Client uses Slack as their main internal communication tool and requests updates to be shared in a dedicated finance channel.

Org Structure & Key Stakeholders

Finance responsibilities are split across three people: a finance lead, an operations manager, and the CEO.

The finance lead will be the primary point of contact for approvals and categorization questions.`;
    setRecap(generatedNotes);
  };

  const handleSaveToLevvy = () => {
    const notes = `
<h3>${clientName || 'Meeting'} Recap</h3>
<p>${recap}</p>
    `.trim();
    
    onSaveNotes(notes);
    onClose();
  };

  const hasNotes = recap.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ai-note-taker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-note-taker-header">
          <h2>{meetingTitle}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close" title="Close">
            ✕
          </button>
        </div>

        <div className="ai-note-taker-body">
          <div className="ai-recap-section">
            <textarea
              className="recap-textarea"
              placeholder="AI will generate a concise overview of the meeting..."
              value={recap}
              onChange={(e) => setRecap(e.target.value)}
              rows={6}
            />
          </div>
          
          <div className="ai-note-taker-actions">
            {!hasNotes ? (
              <button className="button button-primary generate-button" onClick={handleGenerateNotes}>
                Generate AI Notes
              </button>
            ) : (
              <button className="button button-primary save-button" onClick={handleSaveToLevvy}>
                Save to Levvy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINoteTaker;

