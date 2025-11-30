import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/fleet" element={<Dashboard />} />
        <Route path="/analytics" element={<Dashboard />} />
        <Route path="/compare" element={<Dashboard />} />
        <Route path="/settings" element={<Dashboard />} />
        <Route path="/ship/:shipId" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
