import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import Chat from './pages/Chat';
import MilestoneDetail from './pages/MilestoneDetail';
import McpIntegration from './pages/McpIntegration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-plan" element={<CreatePlan />} />
          <Route path="/plans" element={<Navigate to="/create-plan" replace />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/mcp" element={<McpIntegration />} />
          <Route path="/milestone/:id" element={<MilestoneDetail />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
