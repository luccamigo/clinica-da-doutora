import React, { useEffect } from 'react';
import Modal from './Modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatientDetails, deletePatient, fetchPatients } from '../features/patients/patientsSlice';
import { formatApiError } from '../utils/formatError';

const Row = ({ label, value }) => (
  <div className="col-12 col-md-6">
    <div className="card card-body py-2">
      <div className="text-uppercase small text-primary fw-bold mb-1">{label}</div>
      <div>{value || '—'}</div>
    </div>
  </div>
);

const PatientDetailsModal = ({ open, cpf, onClose, onEdit }) => {
  const dispatch = useDispatch();
  const patient = useSelector((s) => (cpf ? s.patients.byCpf[cpf] : null));
  const status = useSelector((s) => s.patients.status);

  useEffect(() => { if (open && cpf) dispatch(fetchPatientDetails(cpf)); }, [open, cpf, dispatch]);

  const onDelete = async () => {
    if (!cpf) return;
    if (!window.confirm('Tem certeza que deseja excluir este paciente?')) return;
    const action = await dispatch(deletePatient(cpf));
    if (deletePatient.fulfilled.match(action)) {
      dispatch(fetchPatients(''));
      onClose && onClose();
    } else {
      alert(formatApiError(action.payload || action.error || 'Erro ao excluir'));
    }
  };

  const footer = (
    <div>
      <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
      <button className="btn btn-outline-secondary" onClick={() => onEdit && onEdit(cpf)}>Editar</button>
      <button className="btn btn-danger" onClick={onDelete}>Excluir</button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Detalhes do Paciente" width="44rem" footer={footer}>
      {!patient && status==='loading' && <div>Carregando...</div>}
      {patient && (
        <div className="container-fluid">
          <div className="row g-3">
            <Row label="Nome" value={patient.nome_completo} />
            <Row label="CPF" value={patient.cpf} />
            <Row label="Nascimento" value={patient.data_nascimento} />
            <Row label="Telefone" value={patient.telefone} />
            <Row label="Email" value={patient.email} />
            <Row label="Responsável CPF" value={patient.responsavel_cpf} />

            <div className="col-12">
              <div className="card">
                <div className="card-body pb-2">
                  <h5 className="card-title">Cirurgias</h5>
                </div>
                <ul className="list-group list-group-flush">
                  {(patient.cirurgias || []).map((c) => (
                    <li key={`c${c.id}`} className="list-group-item">{c.nome} {c.data ? `- ${c.data}` : ''}</li>
                  ))}
                  {(!patient.cirurgias || patient.cirurgias.length===0) && <li className="list-group-item text-muted">—</li>}
                </ul>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-body pb-2">
                  <h5 className="card-title">Medicações</h5>
                </div>
                <ul className="list-group list-group-flush">
                  {(patient.medicacoes || []).map((m) => (
                    <li key={`m${m.id}`} className="list-group-item">{m.nome} {m.dosagem ? `- ${m.dosagem}` : ''}</li>
                  ))}
                  {(!patient.medicacoes || patient.medicacoes.length===0) && <li className="list-group-item text-muted">—</li>}
                </ul>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-body pb-2">
                  <h5 className="card-title">Alergias</h5>
                </div>
                <ul className="list-group list-group-flush">
                  {(patient.alergias || []).map((a) => (
                    <li key={`a${a.id}`} className="list-group-item">{a.agente} {a.severidade ? `- ${a.severidade}` : ''}</li>
                  ))}
                  {(!patient.alergias || patient.alergias.length===0) && <li className="list-group-item text-muted">—</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PatientDetailsModal;
