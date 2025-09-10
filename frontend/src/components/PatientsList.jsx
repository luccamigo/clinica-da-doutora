// Lista de pacientes: busca inicial e seleção para abrir detalhes
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatients } from '../features/patients/patientsSlice';
import styles from './PatientsList.module.scss';

const PatientsList = ({ onSelect }) => {
  const dispatch = useDispatch();
  const { order, list, byCpf, status, error } = useSelector((s) => s.patients);

  // Carrega lista inicial ao montar
  useEffect(() => { dispatch(fetchPatients('')); }, [dispatch]);

  const source = (list && list.length) ? list : (order.length ? order : []);
  const names = source.map((cpf) => byCpf[cpf]?.nome_completo || cpf);
  return (
    <div className={`card ${styles.panel}`}>
      <div className="card-body">
        <h5 className={`card-title ${styles.title}`}>Pacientes</h5>
      </div>
      <ul className={`list-group list-group-flush ${styles.list}`}>
        {source.map((cpf, i) => (
          <li className={`list-group-item text-center ${styles.item}`} key={cpf || i} role="button" onClick={() => onSelect && onSelect(cpf)}>
            {byCpf[cpf]?.nome_completo || cpf}
          </li>
        ))}
        {names.length === 0 && (<li className={`list-group-item text-muted text-center ${styles.empty}`}>Nenhum paciente encontrado.</li>)}
      </ul>
      {status === 'loading' && (<div className={`text-center text-muted py-2 ${styles.empty}`}>Carregando...</div>)}
      {error && (<div className={`text-center text-danger py-2 ${styles.empty}`}>Erro: {String(error)}</div>)}
    </div>
  );
};

export default PatientsList;
