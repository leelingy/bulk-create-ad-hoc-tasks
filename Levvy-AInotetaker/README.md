# Levvy AI Note Taker

A React application that allows users to highlight text in meeting notes and save it to workflow notes or create ad-hoc tasks.

## Features

- **Text Selection**: Highlight text in meeting notes to trigger action toolbar
- **Add to Workflow Notes**: Save selected text to workflow notes with client and workflow selection
- **Create Ad Hoc Task**: Create tasks from selected text with automatic client population
- **Typeahead Search**: Search and select workflows from dropdown lists

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. Open the meeting modal
2. Highlight any text in the notes section
3. A toolbar will appear with two options:
   - **Add to Workflow Notes**: Opens modal to save text to workflow notes
   - **Create Ad Hoc Task**: Opens modal to create a new task

## Project Structure

```
src/
  components/
    MeetingModal.tsx          # Main meeting modal component
    MeetingNotes.tsx           # Notes component with text selection
    TextSelectionToolbar.tsx   # Toolbar that appears on text selection
    AddToWorkflowNotesModal.tsx # Modal for adding to workflow notes
    CreateTaskModal.tsx        # Modal for creating tasks
  types.ts                     # TypeScript type definitions
  App.tsx                      # Main app component
```

