import { useState } from 'react';
import './App.css';
import StudentDashboard from './dashboards/StudentPopulation/StudentDashboard';
import PVSolarDashboard from './dashboards/PVSolar/PVSolarDashboard';
import Sidebar from './components/Sidebar';

function App() {
  const [currentDashboard, setCurrentDashboard] = useState('student');

  const handleDashboardChange = (dashboardKey) => {
    setCurrentDashboard(dashboardKey);
  };

  const handlePushToMain = () => {
    // TODO: Implement push to main dashboard functionality
    console.log('Push to main dashboard');
  };

  const renderDashboard = () => {
    switch (currentDashboard) {
      case 'student':
        return <StudentDashboard />;
      case 'solar':
        return <PVSolarDashboard />;
      case 'main':
      case 'finance':
      case 'travel':
      default:
        return (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            color: '#666'
          }}>
            <h2>Dashboard Coming Soon</h2>
            <p>This dashboard is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <div className="sidebar">
        <Sidebar 
          currentDashboard={currentDashboard}
          onDashboardChange={handleDashboardChange}
          onPushToMain={handlePushToMain}
        />
      </div>
      <div className="main-content">
        {renderDashboard()}
      </div>
    </div>
  );
}

export default App;
