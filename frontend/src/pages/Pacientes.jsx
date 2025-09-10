// Página de Pacientes: busca, lista e modais de CRUD
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import SearchBar from '../components/SearchBar';
import PatientsList from '../components/PatientsList';
import NewPatientModal from '../components/NewPatientModal';
import PatientDetailsModal from '../components/PatientDetailsModal';
import EditPatientModal from '../components/EditPatientModal';
import { fetchPatients } from '../features/patients/patientsSlice';

export default function PacientesPage() {
  const dispatch = useDispatch();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsCpf, setDetailsCpf] = useState(null);
  const [editCpf, setEditCpf] = useState(null);

  const onSearch = (text) => {
    const value = String(text || '').trim();
    // Sempre usa a listagem com filtro (q). Evita alternância entre erro 404/422
    // quando o usuário digita 11 dígitos (CPF) e continua digitando.
    dispatch(fetchPatients(value));
  };

  return (
    <div className="container-fluid">
      <header className="row align-items-center g-2 mb-3">
        <div className="col">
          <h1 className="m-0" style={{fontSize:'clamp(2rem,4.5vw,3.5rem)',fontWeight:800}}>Pacientes</h1>
        </div>
        <div className="col-auto text-end">
          <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>+ Adicionar Paciente</button>
        </div>
      </header>
      <section className="mb-3">
        <SearchBar placeholder="Pesquisar Paciente..." onSearch={onSearch} />
      </section>
      <section>
        <PatientsList onSelect={(cpf) => setDetailsCpf(cpf)} />
      </section>
      <NewPatientModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <PatientDetailsModal open={!!detailsCpf} cpf={detailsCpf} onClose={() => setDetailsCpf(null)} onEdit={(cpf)=>{ setDetailsCpf(null); setEditCpf(cpf); }} />
      <EditPatientModal open={!!editCpf} cpf={editCpf} onClose={() => setEditCpf(null)} />
    </div>
  );
}
