import React, { useState, useRef, useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { TextSelection } from "../types";
import TextSelectionToolbar from "./TextSelectionToolbar";
import "./MeetingNotes.css";

interface MeetingNotesProps {
  notes: string;
  onAddToWorkflowNotes: (selectedText: string) => void;
  onCreateAdHocTask: (selectedText: string) => void;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({
  notes,
  onAddToWorkflowNotes,
  onCreateAdHocTask,
}) => {
  const [selectedText, setSelectedText] = useState<TextSelection | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  const sanitizedNotes = useMemo(
    () => DOMPurify.sanitize(notes, { USE_PROFILES: { html: true } }),
    [notes],
  );

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        setSelectedText(null);
        setToolbarPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();

      if (text.length === 0) {
        setSelectedText(null);
        setToolbarPosition(null);
        return;
      }

      if (notesRef.current && notesRef.current.contains(range.commonAncestorContainer)) {
        const boundingRect = range.getBoundingClientRect();
        const containerRect = notesRef.current.getBoundingClientRect();

        setSelectedText({
          text,
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          boundingRect,
        });

        const top = boundingRect.top - containerRect.top - 10;
        const left = boundingRect.left - containerRect.left + boundingRect.width / 2;
        const toolbarWidth = 300;
        const adjustedLeft = Math.max(
          toolbarWidth / 2,
          Math.min(left, containerRect.width - toolbarWidth / 2),
        );

        setToolbarPosition({ top, left: adjustedLeft });
      } else {
        setSelectedText(null);
        setToolbarPosition(null);
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 10);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (target && (target as Element).closest?.(".text-selection-toolbar")) {
        return;
      }
      if (notesRef.current && !notesRef.current.contains(target)) {
        setSelectedText(null);
        setToolbarPosition(null);
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleAddToWorkflowNotes = () => {
    if (selectedText) {
      onAddToWorkflowNotes(selectedText.text);
      setSelectedText(null);
      setToolbarPosition(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleCreateAdHocTask = () => {
    if (selectedText) {
      onCreateAdHocTask(selectedText.text);
      setSelectedText(null);
      setToolbarPosition(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div className="meeting-notes-container" ref={notesRef}>
      <div className="meeting-notes-content">
        <div dangerouslySetInnerHTML={{ __html: sanitizedNotes }} />
      </div>
      {toolbarPosition && selectedText && (
        <TextSelectionToolbar
          position={toolbarPosition}
          onAddToWorkflowNotes={handleAddToWorkflowNotes}
          onCreateAdHocTask={handleCreateAdHocTask}
        />
      )}
    </div>
  );
};

export default MeetingNotes;
