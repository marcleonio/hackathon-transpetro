import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { NaviosPage } from './pages/NaviosPage';
import { NavioFormPage } from './pages/NavioFormPage';
import { RelatoriosPage } from './pages/RelatoriosPage';

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
        <Route path="/navios" element={<Dashboard />} />
        <Route path="/navios/novo" element={<Dashboard />} />
        <Route path="/navios/:id" element={<Dashboard />} />
        <Route path="/relatorios" element={<Dashboard />} />
        <Route path="/relatorios/novo" element={<Dashboard />} />
        <Route path="/relatorios/:id" element={<Dashboard />} />
        <Route path="/docagens" element={<Dashboard />} />
        <Route path="/docagens/novo" element={<Dashboard />} />
        <Route path="/docagens/:id" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
