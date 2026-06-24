import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ManualNotesEditor.css';

interface ManualNotesEditorProps {
  initialNotes: string;
  onSave: (notes: string) => void;
  onCancel: () => void;
}

const ManualNotesEditor: React.FC<ManualNotesEditorProps> = ({
  initialNotes,
  onSave,
  onCancel,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleSave = () => {
    onSave(notes);
  };

  return (
    <div className="manual-notes-editor">
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
        placeholder="Start typing your notes..."
      />
      <div className="manual-editor-actions">
        <button className="button button-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="button button-primary" onClick={handleSave}>
          Save Notes
        </button>
      </div>
    </div>
  );
};

export default ManualNotesEditor;

