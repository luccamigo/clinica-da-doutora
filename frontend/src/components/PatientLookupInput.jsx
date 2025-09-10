import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../features/patients/patientsSlice';
import styles from './PatientLookupInput.module.scss';

// Busca pacientes por nome/CPF e retorna CPF selecionado via onChangeCpf
// Props: { id, label, placeholder, valueCpf, onChangeCpf, required }
export default function PatientLookupInput({ id, label = 'Paciente', placeholder = 'Buscar por nome ou CPF', valueCpf, onChangeCpf, required = false }) {
  const dispatch = useDispatch();
  const { byCpf, list, status } = useSelector((s) => s.patients);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const containerRef = useRef(null);

  // nome exibido quando já há CPF selecionado
  const selectedName = useMemo(() => {
    if (!valueCpf) return '';
    return byCpf[valueCpf]?.nome_completo || valueCpf;
  }, [valueCpf, byCpf]);

  useEffect(() => {
    // sincroniza o input com a seleção externa
    if (valueCpf) setQuery(selectedName);
  }, [valueCpf, selectedName]);

  // busca com debounce ao digitar
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query || query.trim().length < 2) { setOpen(false); return; }
    timer.current = setTimeout(() => {
      dispatch(fetchPatients(query));
      setOpen(true);
    }, 300);
    return () => timer.current && clearTimeout(timer.current);
  }, [query, dispatch]);

  const suggestions = useMemo(() => {
    // pega lista atual do slice e mapeia para objetos
    return (list || []).map((cpf) => byCpf[cpf]).filter(Boolean);
  }, [list, byCpf]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const selectPatient = (cpf) => {
    onChangeCpf && onChangeCpf(cpf);
    setOpen(false);
  };

  const clearSelection = () => {
    setQuery('');
    onChangeCpf && onChangeCpf('');
    setOpen(false);
  };

  return (
    <div className="col-12" ref={containerRef}>
      {label && <label htmlFor={id} className="form-label">{label}{required ? ' *' : ''}</label>}
      <div className={styles.root}>
        <div className="input-group">
          <span className="input-group-text bg-white text-muted">🔎</span>
          <input
            id={id}
            className="form-control"
            placeholder={placeholder}
            value={query}
            onChange={(e)=>{ setQuery(e.target.value); if (!e.target.value) onChangeCpf && onChangeCpf(''); }}
            onFocus={()=>{ if (query && query.length >= 2) setOpen(true); }}
            aria-autocomplete="list"
            autoComplete="off"
          />
          {valueCpf && (
            <span className="input-group-text bg-white">
              <span className="badge text-bg-primary">{valueCpf}</span>
            </span>
          )}
        </div>
        {valueCpf && (
          <button
            type="button"
            className={`btn btn-sm btn-outline-secondary ${styles.clearBtn}`}
            onClick={clearSelection}
            aria-label="Limpar seleção"
            title="Limpar seleção"
          >
            ×
          </button>
        )}
        {open && (
          <div className={`${styles.menu} list-group`} role="listbox" aria-labelledby={id}>
            {status === 'loading' && <div className="list-group-item text-muted">Carregando...</div>}
            {status !== 'loading' && suggestions.length === 0 && (
              <div className="list-group-item text-muted">Nenhum resultado</div>
            )}
            {suggestions.map((p) => (
              <button
                key={p.cpf}
                type="button"
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                onClick={() => selectPatient(p.cpf)}
              >
                <span className="text-truncate">{p.nome_completo}</span>
                <small className="text-muted ms-2">{p.cpf}</small>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
