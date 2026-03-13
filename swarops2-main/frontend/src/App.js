import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from './components/ui/sonner';
import './index.css';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContentAgent from './pages/ContentAgent';
import EmailAgent from './pages/EmailAgent';
import SchedulerAgent from './pages/SchedulerAgent';
import BudgetAgent from './pages/BudgetAgent';
import VolunteerAgent from './pages/VolunteerAgent';
import RunSwarm from './pages/RunSwarm';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AppContext = React.createContext();

function App() {
  const [currentEventId, setCurrentEventId] = useState('event_demo_001');
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userId] = useState('user_demo_001');

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API}/activities/latest?limit=20`);
      setActivities(response.data);
    } catch (e) {
      console.error('Failed to fetch activities', e);
    }
  };

  const contextValue = {
    currentEventId,
    setCurrentEventId,
    events,
    setEvents,
    activities,
    userId,
    API
  };

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <div className="App">
          <div className="scanlines" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="run-swarm" element={<RunSwarm />} />
              <Route path="content" element={<ContentAgent />} />
              <Route path="email" element={<EmailAgent />} />
              <Route path="scheduler" element={<SchedulerAgent />} />
              <Route path="budget" element={<BudgetAgent />} />
              <Route path="volunteer" element={<VolunteerAgent />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
