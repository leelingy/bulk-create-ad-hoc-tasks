import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/levvy-ai-notetaker');
  };

  const handleQuickAddTask = () => {
    navigate('/quick-add-task');
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h2 className="landing-subtitle">Levvy Prototypes</h2>
        <div className="button-container">
          <button 
            onClick={handleGetStarted}
            className="cta-button"
          >
            Levvy AI Notetaker
          </button>
          <button 
            onClick={handleQuickAddTask}
            className="cta-button"
          >
            Quick Add Ad Hoc Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
