import { useState } from 'react';
import QuickAddAdHocTaskModal from './QuickAddAdHocTaskModal';
import { CLIENTS, WORKFLOWS } from '../lib/mockData';
import './QuickAddAdHocTask.css';

function QuickAddAdHocTask() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCreateTask = (taskData: {
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
  }) => {
    console.log('Task created:', taskData);
    // Handle task creation logic here
    setIsModalOpen(false);
  };

  return (
    <div className="quick-add-ad-hoc-task">
      <QuickAddAdHocTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={CLIENTS[0]}
        workflows={WORKFLOWS}
        onCreate={handleCreateTask}
      />
    </div>
  );
}

export default QuickAddAdHocTask;
