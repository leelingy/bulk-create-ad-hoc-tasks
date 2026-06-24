import { useCallback, useEffect, useState } from "react";
import MeetingModal from "./components/MeetingModal";
import type { CreatedTask, Meeting } from "./types";
import {
  CLIENTS,
  createSampleMeeting,
  SAMPLE_HTML_NOTES,
  TENANT_USERS,
  WORKFLOWS,
} from "./lib/mockData";
import { parseMeetingIdFromSearch } from "./lib/meetingDeepLink";
import "./App.css";

function MainApp() {
  const [meetings, setMeetings] = useState<Meeting[]>([
    createSampleMeeting({ summaryHtml: SAMPLE_HTML_NOTES }),
  ]);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [createdTasks, setCreatedTasks] = useState<CreatedTask[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const activeMeeting = meetings.find((m) => m.id === activeMeetingId) ?? null;

  const openMeeting = useCallback((id: string) => {
    setActiveMeetingId(id);
  }, []);

  useEffect(() => {
    const meetingId = parseMeetingIdFromSearch(window.location.search);
    if (meetingId) {
      const exists = meetings.some((m) => m.id === meetingId);
      if (exists) {
        openMeeting(meetingId);
      }
    }
  }, [meetings, openMeeting]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleStartMeeting = () => {
    const m = createSampleMeeting({ id: crypto.randomUUID(), summaryHtml: "" });
    setMeetings((prev) => [...prev, m]);
    openMeeting(m.id);
  };

  const handleOpenSampleMeeting = () => {
    const sample = meetings[0];
    openMeeting(sample.id);
  };

  const handleMeetingUpdate = (updated: Meeting) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m)),
    );
  };

  const handleTasksCreated = (tasks: CreatedTask[]) => {
    setCreatedTasks((prev) => [...prev, ...tasks]);
    showToast(
      tasks.length === 1
        ? `Created 1 task for ${tasks[0].clientName}`
        : `Created ${tasks.length} tasks`,
    );
  };

  return (
    <div className="App">
      <div className="app-header">
        <h1>Levvy AI Note Taker</h1>
        <div className="header-actions">
          <button type="button" onClick={handleStartMeeting} className="start-meeting-button">
            Start Meeting
          </button>
          <button type="button" onClick={handleOpenSampleMeeting} className="open-modal-button">
            Open Meeting Modal
          </button>
        </div>
      </div>

      {createdTasks.length > 0 && (
        <div className="created-tasks-panel">
          <h2>Created tasks ({createdTasks.length})</h2>
          <ul>
            {createdTasks.map((t) => (
              <li key={t.id}>
                <strong>{t.taskName}</strong> — {t.clientName}
                {t.assigneeName && ` · ${t.assigneeName}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {toast && <div className="app-toast">{toast}</div>}

      {activeMeeting && (
        <MeetingModal
          isOpen={!!activeMeetingId}
          onClose={() => setActiveMeetingId(null)}
          meeting={activeMeeting}
          clients={CLIENTS}
          workflows={WORKFLOWS}
          users={TENANT_USERS}
          onMeetingUpdate={handleMeetingUpdate}
          onTasksCreated={handleTasksCreated}
        />
      )}
    </div>
  );
}

export default MainApp;
