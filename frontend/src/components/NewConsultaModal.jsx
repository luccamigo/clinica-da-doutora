import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from './Modal';
import { criarConsulta } from '../features/consultas/consultasSlice';
import { formatApiError } from '../utils/formatError';
import PatientLookupInput from './PatientLookupInput';
import { normalizeCpf } from '../utils/cpf';

const NewConsultaModal = ({ open, defaultDia, defaultHora, onClose }) => {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.consultas.status);
  const [cpf, setCpf] = useState('');
  const [dia, setDia] = useState(defaultDia || '');
  const [hora, setHora] = useState(defaultHora || '');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (open) {
      setErro('');
      setCpf('');
      setDia(defaultDia || '');
      setHora(defaultHora || '');
      setDescricao('');
    }
  }, [open, defaultDia, defaultHora]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    const cpfNorm = normalizeCpf(cpf || '');
    if (!cpfNorm) { setErro('Selecione um paciente válido (CPF completo).'); return; }
    if (!dia) { setErro('Informe a data.'); return; }
    if (!hora) { setErro('Informe o horário.'); return; }
    if (!descricao.trim()) { setErro('Descreva a consulta.'); return; }
    const action = await dispatch(criarConsulta({ cpf: cpfNorm, dia, hora, descricao }));
    if (criarConsulta.fulfilled.match(action)) onClose && onClose(true);
    else setErro(formatApiError(action.payload) || action.error?.message || 'Erro ao criar consulta');
  };

  const footer = (
    <div>
      <button type="button" className="btn btn-secondary" onClick={()=>onClose && onClose(false)}>Cancelar</button>
      <button type="submit" form="form-nova-consulta" className="btn btn-primary" disabled={status==='loading'}>
        {status==='loading' ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );

  return (
    <Modal open={open} onClose={()=>onClose && onClose(false)} title="Nova Consulta" footer={footer} width="36rem">
      <form id="form-nova-consulta" onSubmit={onSubmit}>
        <div className="container-fluid">
          <div className="row g-3">
            <PatientLookupInput
              id="paciente"
              label="Paciente"
              placeholder="Buscar por nome ou CPF"
              valueCpf={cpf}
              onChangeCpf={(v)=>setCpf(v)}
              required
            />
            <div className="col-12 col-md-6">
              <label htmlFor="dia" className="form-label">Data</label>
              <input
                id="dia"
                type="date"
                className="form-control"
                value={dia}
                onChange={(e)=>setDia(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="hora" className="form-label">Horário</label>
              <input
                id="hora"
                type="time"
                className="form-control"
                value={hora}
                onChange={(e)=>setHora(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label htmlFor="descricao" className="form-label">Descrição</label>
              <input
                id="descricao"
                className="form-control"
                value={descricao}
                onChange={(e)=>setDescricao(e.target.value)}
                placeholder="Ex.: Consulta de rotina"
              />
            </div>
            {erro && (
              <div className="col-12">
                <div className="alert alert-danger mb-0" role="alert">{erro}</div>
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewConsultaModal;
