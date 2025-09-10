import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from './Modal';
import { removerConsulta } from '../features/consultas/consultasSlice';

const Row = ({ label, value }) => (
  <div className="col-12 col-md-6">
    <div className="card card-body py-2">
      <div className="text-uppercase small text-primary fw-bold mb-1">{label}</div>
      <div>{value || '—'}</div>
    </div>
  </div>
);

const ConsultaDetailsModal = ({ open, id, onClose }) => {
  const dispatch = useDispatch();
  const consulta = useSelector((s) => (id ? s.consultas.byId[id] : null));

  useEffect(() => { /* placeholder para futuras cargas por id */ }, [id]);

  const onDelete = async () => {
    if (!id) return;
    if (!window.confirm('Excluir esta consulta?')) return;
    await dispatch(removerConsulta(id));
    onClose && onClose(true);
  };

  const footer = (
    <div>
      <button type="button" className="btn btn-secondary" onClick={()=>onClose && onClose(false)}>Fechar</button>
      <button type="button" className="btn btn-danger" onClick={onDelete}>Excluir</button>
    </div>
  );

  return (
    <Modal open={open} onClose={()=>onClose && onClose(false)} title="Detalhes da Consulta" footer={footer} width="40rem">
      {!consulta && <div>Carregando...</div>}
      {consulta && (
        <div className="container-fluid">
          <div className="row g-3">
            <Row label="CPF do Paciente" value={consulta.cpfPaciente || consulta.cpf_paciente} />
            <Row label="Data" value={consulta.dia} />
            <Row label="Hora" value={consulta.hora} />
            <Row label="Descrição" value={consulta.descricao} />
            <Row label="Estado" value={consulta.estado} />
            <Row label="Observações" value={consulta.observacoes} />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ConsultaDetailsModal;
