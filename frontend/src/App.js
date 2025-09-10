// App entry: define rotas e layout base
import './styles/global.scss';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PacientesPage from './pages/Pacientes';
import AgendaPage from './pages/Agenda';
import EstoquePage from './pages/Estoque';

function App() {
  // Rotas aninhadas: MainLayout é o shell visual
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/pacientes" replace />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/estoque" element={<EstoquePage />} />
      </Route>
    </Routes>
  );
}

export default App;
