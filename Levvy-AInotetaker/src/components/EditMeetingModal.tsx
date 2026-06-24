import React, { useMemo, useState } from "react";
import type { Client, Meeting } from "../types";
import "./Modal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  clients: Client[];
  onSave: (updated: Meeting) => void;
};

const EditMeetingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  meeting,
  clients,
  onSave,
}) => {
  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(meeting.date);
  const [time, setTime] = useState(meeting.time);
  const [clientSearch, setClientSearch] = useState(meeting.client.name);
  const [selectedClient, setSelectedClient] = useState<Client>(meeting.client);
  const [showDropdown, setShowDropdown] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(meeting.title);
      setDate(meeting.date);
      setTime(meeting.time);
      setSelectedClient(meeting.client);
      setClientSearch(meeting.client.name);
    }
  }, [isOpen, meeting]);

  const filteredClients = useMemo(() => {
    const needle = clientSearch.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(needle));
  }, [clientSearch, clients]);

  const handleSave = () => {
    onSave({
      ...meeting,
      title: title.trim() || meeting.title,
      date: date.trim(),
      time: time.trim(),
      client: selectedClient,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit meeting</h2>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label>
              Title <span className="required">*</span>
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="form-field">
            <label>
              Client <span className="required">*</span>
            </label>
            <div className="dropdown-container">
              <input
                type="text"
                className="dropdown-input"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="Search clients..."
              />
              {showDropdown && filteredClients.length > 0 && (
                <div className="dropdown-list">
                  {filteredClients.map((c) => (
                    <div
                      key={c.id}
                      className={`dropdown-item ${selectedClient.id === c.id ? "selected" : ""}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedClient(c);
                        setClientSearch(c.name);
                        setShowDropdown(false);
                      }}
                    >
                      {c.name}
                      {!c.hasPortal && (
                        <span style={{ color: "#999", fontSize: 12, marginLeft: 8 }}>
                          (no portal)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-field">
            <label>Date</label>
            <input type="text" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Time</label>
            <input type="text" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-buttons">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="button button-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMeetingModal;
