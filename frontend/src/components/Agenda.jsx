import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { criarConsulta, fetchConsultasPorDia, removerConsulta } from '../features/consultas/consultasSlice';
import Modal from './Modal';
import { formatApiError } from '../utils/formatError';
import { toFormattedCpf } from '../utils/cpf';

const rangeSlots = (start = '08:00', end = '18:00', stepMin = 30) => {
  const toMin = (t) => {
    const [h, m] = t.split(':').map((x) => parseInt(x, 10));
    return h * 60 + (m || 0);
  };
  const toStr = (min) => {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };
  const res = [];
  for (let t = toMin(start); t <= toMin(end); t += stepMin) res.push(toStr(t));
  return res;
};

const NewConsultaModal = ({ open, dia, onClose, onCreated }) => {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.consultas.status);
  const [cpf, setCpf] = useState('');
  const [hora, setHora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => { if (open) { setErro(''); setCpf(''); setHora(''); setDescricao(''); } }, [open]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    const cpfFmt = toFormattedCpf(cpf || '');
    if (!cpfFmt) { setErro('CPF deve seguir o padrão XXX.XXX.XXX-XX'); return; }
    if (!hora) { setErro('Informe o horário.'); return; }
    if (!descricao.trim()) { setErro('Descreva o motivo da consulta.'); return; }
    const action = await dispatch(criarConsulta({ cpf: cpfFmt, dia, hora, descricao }));
    if (criarConsulta.fulfilled.match(action)) {
      onCreated && onCreated(action.payload);
      onClose && onClose();
    } else {
      setErro(formatApiError(action.payload) || action.error?.message || 'Erro ao criar consulta');
    }
  };

  const footer = (
    <div>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      <button type="submit" form="form-nova-consulta" className="btn btn-primary" disabled={status==='loading'}>
        {status==='loading' ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={`Nova consulta - ${dia}`} footer={footer} width="36rem">
      <form id="form-nova-consulta" onSubmit={onSubmit}>
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="cpf" className="form-label">CPF do paciente</label>
              <input id="cpf" className="form-control" value={cpf} onChange={(e)=>setCpf(e.target.value)} placeholder="Somente números" />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="hora" className="form-label">Horário</label>
              <input id="hora" type="time" className="form-control" value={hora} onChange={(e)=>setHora(e.target.value)} />
            </div>
            <div className="col-12">
              <label htmlFor="desc" className="form-label">Descrição</label>
              <input id="desc" className="form-control" value={descricao} onChange={(e)=>setDescricao(e.target.value)} placeholder="Ex.: Consulta de rotina" />
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

const Agenda = () => {
  const dispatch = useDispatch();
  const { byDay, byId, status, error } = useSelector((s) => s.consultas);
  const [dia, setDia] = useState(() => new Date().toISOString().slice(0,10));
  const [open, setOpen] = useState(false);

  useEffect(() => { dispatch(fetchConsultasPorDia(dia)); }, [dia, dispatch]);

  const slots = useMemo(() => rangeSlots('08:00', '18:00', 30), []);
  const ids = byDay[dia] || [];
  const porHora = useMemo(() => {
    const map = {};
    for (const id of ids) {
      const c = byId[id];
      if (!c) continue;
      const h = (c.hora || '').slice(0,5);
      map[h] = map[h] || [];
      map[h].push(c);
    }
    return map;
  }, [ids, byId]);

  const onDelete = async (id) => {
    if (!window.confirm('Remover esta consulta?')) return;
    await dispatch(removerConsulta(id));
  };

  return (
    <div className="agenda">
      <div className="agenda-head">
        <div className="agenda-controls">
          <label className="agenda-datepick">
            <span>Dia</span>
            <input type="date" value={dia} onChange={(e)=>setDia(e.target.value)} />
          </label>
        </div>
        <div className="agenda-actions">
          <button className="btn btn-primary" onClick={()=>setOpen(true)}>+ Nova Consulta</button>
        </div>
      </div>

      <div className="agenda-grid">
        {slots.map((h) => (
          <div key={h} className="agenda-slot">
            <div className="agenda-hour">{h}</div>
            <div className="agenda-items">
              {(porHora[h] || []).map((c) => (
                <div key={c.id} className="agenda-item">
                  <div className="agenda-item__line">
                    <strong>{c.descricao}</strong>
                    <button className="agenda-item__delete" onClick={()=>onDelete(c.id)} aria-label="Excluir">×</button>
                  </div>
                  <div className="agenda-item__meta">CPF: {c.cpfPaciente || c.cpf_paciente}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {status==='loading' && <div className="agenda-loading">Carregando…</div>}
      {error && <div className="agenda-error">Erro: {formatApiError(error)}</div>}

      <NewConsultaModal open={open} dia={dia} onClose={()=>setOpen(false)} onCreated={()=>{ /* noop, lista atualiza pelo slice */ }} />
    </div>
  );
};

export default Agenda;
