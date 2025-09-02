import './styles/global.scss';
import './App.scss';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import PatientsList from './components/PatientsList';

function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main className="content">
        <header className="page-header">
          <h1>Pacientes</h1>
        </header>

        <section className="search-section">
          <SearchBar placeholder="Pesquisar Paciente..." />
        </section>

        <section className="panel-section">
          <PatientsList />
        </section>
      </main>
    </div>
  );
}

export default App;
