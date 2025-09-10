import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { useDispatch, useSelector } from 'react-redux';
import {
  updatePatient,
  fetchPatientDetails,
  fetchPatients,
  createCirurgia, updateCirurgia, deleteCirurgia,
  createMedicacao, updateMedicacao, deleteMedicacao,
  createAlergia, updateAlergia, deleteAlergia,
} from '../features/patients/patientsSlice';
import { formatApiError } from '../utils/formatError';
import { normalizeCpf, maskCpf, CPF_REGEX } from '../utils/cpf';
import PatientLookupInput from './PatientLookupInput';
import { toISODate } from '../utils/date';

const EditPatientModal = ({ open, cpf, onClose }) => {
  const dispatch = useDispatch();
  const patient = useSelector((s) => (cpf ? s.patients.byCpf[cpf] : null));
  const status = useSelector((s) => s.patients.status);
  const [form, setForm] = useState({ nome_completo: '', data_nascimento: '', telefone: '', email: '', responsavel_cpf: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadedCpf, setLoadedCpf] = useState(null);

  // Estados para manipular coleções
  const [newCir, setNewCir] = useState({ nome: '', data: '', observacoes: '' });
  const [newMed, setNewMed] = useState({ nome: '', dosagem: '', frequencia: '' });
  const [newAle, setNewAle] = useState({ agente: '', severidade: '' });
  const [editCir, setEditCir] = useState({}); // { [id]: { nome, data, observacoes } }
  const [editMed, setEditMed] = useState({}); // { [id]: { nome, dosagem, frequencia } }
  const [editAle, setEditAle] = useState({}); // { [id]: { agente, severidade } }
  const [opErrCir, setOpErrCir] = useState('');
  const [opErrMed, setOpErrMed] = useState('');
  const [opErrAle, setOpErrAle] = useState('');
  const [savingIds, setSavingIds] = useState(new Set()); // para linhas individuais

  useEffect(() => { if (open && cpf) dispatch(fetchPatientDetails(cpf)); }, [open, cpf, dispatch]);
  useEffect(() => {
    if (patient && cpf && loadedCpf !== cpf) {
      setForm({
        nome_completo: patient.nome_completo || '',
        data_nascimento: patient.data_nascimento || '',
        telefone: patient.telefone || '',
        email: patient.email || '',
        responsavel_cpf: patient.responsavel_cpf || ''
      });
      setLoadedCpf(cpf);
    }
  }, [patient, cpf, loadedCpf]);
  useEffect(() => { if (!open) { setLoadedCpf(null); } }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // seleção do responsável via busca por nome (sem validação manual)

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const changes = {};
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== (patient?.[k] || '')) changes[k] = v; });
    if ('data_nascimento' in changes) {
      changes.data_nascimento = toISODate(changes.data_nascimento);
    }
    if ('responsavel_cpf' in changes) {
      const norm = normalizeCpf(changes.responsavel_cpf);
      changes.responsavel_cpf = norm || undefined;
    }
    try {
      const action = await dispatch(updatePatient({ cpf, changes }));
      if (updatePatient.fulfilled.match(action)) {
        onClose && onClose();
        dispatch(fetchPatients(''));
      } else {
        setError(formatApiError(action.payload || action.error || 'Erro ao editar'));
      }
    } catch (err) { setError(formatApiError(err)); }
  };

  const footer = (
    <div>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      <button type="submit" form="form-editar-paciente" className="btn btn-primary" disabled={status==='loading'}>
        {status==='loading' ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={`Editar Paciente`} footer={footer} width="44rem">
      <form id="form-editar-paciente" onSubmit={onSubmit}>
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="nome" className="form-label">Nome completo</label>
              <input id="nome" className="form-control" value={form.nome_completo} onChange={(e)=>set('nome_completo', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="nascimento" className="form-label">Data de nascimento</label>
              <input id="nascimento" type="date" className="form-control" value={form.data_nascimento} onChange={(e)=>set('data_nascimento', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="telefone" className="form-label">Telefone</label>
              <input id="telefone" className="form-control" value={form.telefone} onChange={(e)=>set('telefone', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" type="email" className="form-control" value={form.email} onChange={(e)=>set('email', e.target.value)} />
            </div>
            <PatientLookupInput
              id="resp"
              label="Responsável (opcional)"
              placeholder="Buscar por nome ou CPF"
              valueCpf={form.responsavel_cpf}
              onChangeCpf={(v)=>{ set('responsavel_cpf', v); setFieldErrors((fe)=>({ ...fe, responsavel_cpf: '' })); }}
            />
            {error && (
              <div className="col-12">
                <div className="alert alert-danger mb-0" role="alert">{error}</div>
              </div>
            )}

            {/* Cirurgias */}
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Cirurgias</h5>
                  {opErrCir && <div className="alert alert-danger py-2">{opErrCir}</div>}
                  <div className="d-grid gap-2">
                    {(patient?.cirurgias || []).map((c) => {
                      const editing = editCir[c.id] ?? null;
                      const isSaving = savingIds.has(`cir-${c.id}`);
                      const startEdit = () => setEditCir((m) => ({ ...m, [c.id]: { nome: c.nome, data: c.data || '', observacoes: c.observacoes || '' } }));
                      const cancelEdit = () => setEditCir((m) => { const { [c.id]: _, ...rest } = m; return rest; });
                      const setField = (patch) => setEditCir((m) => ({ ...m, [c.id]: { ...m[c.id], ...patch } }));
                      const saveEdit = async () => {
                        setOpErrCir('');
                        setSavingIds((s)=>new Set(s).add(`cir-${c.id}`));
                        try {
                          const payload = editing;
                          const changes = {};
                          if (payload.nome !== c.nome) changes.nome = payload.nome;
                          if ((payload.data || '') !== (c.data || '')) changes.data = payload.data || null;
                          if ((payload.observacoes || '') !== (c.observacoes || '')) changes.observacoes = payload.observacoes || null;
                          if (Object.keys(changes).length === 0) { cancelEdit(); return; }
                          const action = await dispatch(updateCirurgia({ id: c.id, changes }));
                          if (updateCirurgia.rejected.match(action)) {
                            setOpErrCir(formatApiError(action.payload || action.error || 'Erro ao atualizar cirurgia'));
                          } else {
                            await dispatch(fetchPatientDetails(cpf));
                            cancelEdit();
                          }
                        } finally {
                          setSavingIds((s)=>{ const ns = new Set(s); ns.delete(`cir-${c.id}`); return ns; });
                        }
                      };
                      const remove = async () => {
                        setOpErrCir('');
                        setSavingIds((s)=>new Set(s).add(`cir-${c.id}`));
                        try {
                          const action = await dispatch(deleteCirurgia({ id: c.id, cpf }));
                          if (deleteCirurgia.rejected.match(action)) {
                            setOpErrCir(formatApiError(action.payload || action.error || 'Erro ao remover cirurgia'));
                          } else {
                            await dispatch(fetchPatientDetails(cpf));
                          }
                        } finally {
                          setSavingIds((s)=>{ const ns = new Set(s); ns.delete(`cir-${c.id}`); return ns; });
                        }
                      };
                      return (
                        <div className="row g-2 align-items-center" key={`c-${c.id}`}>
                          <div className="col-12 col-md-4">
                            <input className="form-control" disabled={!editing} value={(editing ? editing.nome : c.nome) || ''} onChange={(e)=>setField({ nome: e.target.value })} />
                          </div>
                          <div className="col-12 col-md-3">
                            <input className="form-control" type="date" disabled={!editing} value={(editing ? editing.data : (c.data || '')) || ''} onChange={(e)=>setField({ data: e.target.value })} />
                          </div>
                          <div className="col-12 col-md-4">
                            <input className="form-control" disabled={!editing} value={(editing ? editing.observacoes : (c.observacoes || '')) || ''} onChange={(e)=>setField({ observacoes: e.target.value })} />
                          </div>
                          <div className="col-12 col-md-auto d-flex gap-2">
                            {!editing ? (
                              <>
                                <button type="button" className="btn btn-outline-primary" onClick={startEdit}>Editar</button>
                                <button type="button" className="btn btn-outline-danger" onClick={remove} disabled={isSaving}>Remover</button>
                              </>
                            ) : (
                              <>
                                <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={isSaving}>Salvar</button>
                                <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isSaving}>Cancelar</button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="row g-2 align-items-center">
                      <div className="col-12 col-md-4">
                        <input className="form-control" placeholder="Nome" value={newCir.nome} onChange={(e)=>setNewCir((s)=>({ ...s, nome: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-3">
                        <input className="form-control" type="date" value={newCir.data} onChange={(e)=>setNewCir((s)=>({ ...s, data: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-4">
                        <input className="form-control" placeholder="Observações" value={newCir.observacoes} onChange={(e)=>setNewCir((s)=>({ ...s, observacoes: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-auto">
                        <button type="button" className="btn btn-primary" onClick={async ()=>{
                          setOpErrCir('');
                          const data = { nome: newCir.nome, data: newCir.data || undefined, observacoes: newCir.observacoes || undefined };
                          const action = await dispatch(createCirurgia({ cpf, data }));
                          if (createCirurgia.rejected.match(action)) {
                            setOpErrCir(formatApiError(action.payload || action.error || 'Erro ao adicionar cirurgia'));
                          } else {
                            setNewCir({ nome: '', data: '', observacoes: '' });
                            dispatch(fetchPatientDetails(cpf));
                          }
                        }} disabled={!newCir.nome}>+ Adicionar cirurgia</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medicações */}
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Medicações</h5>
                  {opErrMed && <div className="alert alert-danger py-2">{opErrMed}</div>}
                  <div className="d-grid gap-2">
                    {(patient?.medicacoes || []).map((m) => {
                      const editing = editMed[m.id] ?? null;
                      const isSaving = savingIds.has(`med-${m.id}`);
                      const startEdit = () => setEditMed((map) => ({ ...map, [m.id]: { nome: m.nome, dosagem: m.dosagem || '', frequencia: m.frequencia || '' } }));
                      const cancelEdit = () => setEditMed((map) => { const { [m.id]: _, ...rest } = map; return rest; });
                      const setField = (patch) => setEditMed((map) => ({ ...map, [m.id]: { ...map[m.id], ...patch } }));
                      const saveEdit = async () => {
                        setOpErrMed('');
                        setSavingIds((s)=>new Set(s).add(`med-${m.id}`));
                        try {
                          const payload = editing;
                          const changes = {};
                          if (payload.nome !== m.nome) changes.nome = payload.nome;
                          if ((payload.dosagem || '') !== (m.dosagem || '')) changes.dosagem = payload.dosagem || null;
                          if ((payload.frequencia || '') !== (m.frequencia || '')) changes.frequencia = payload.frequencia || null;
                          if (Object.keys(changes).length === 0) { cancelEdit(); return; }
                          const action = await dispatch(updateMedicacao({ id: m.id, changes }));
                          if (updateMedicacao.rejected.match(action)) {
                            setOpErrMed(formatApiError(action.payload || action.error || 'Erro ao atualizar medicação'));
                          } else {
                            await dispatch(fetchPatientDetails(cpf));
                            cancelEdit();
                          }
                        } finally {
                          setSavingIds((s)=>{ const ns = new Set(s); ns.delete(`med-${m.id}`); return ns; });
                        }
                      };
                      const remove = async () => {
                        setOpErrMed('');
                        setSavingIds((s)=>new Set(s).add(`med-${m.id}`));
                        try {
                          const action = await dispatch(deleteMedicacao({ id: m.id, cpf }));
                          if (deleteMedicacao.rejected.match(action)) {
                            setOpErrMed(formatApiError(action.payload || action.error || 'Erro ao remover medicação'));
                          } else {
                            await dispatch(fetchPatientDetails(cpf));
                          }
                        } finally {
                          setSavingIds((s)=>{ const ns = new Set(s); ns.delete(`med-${m.id}`); return ns; });
                        }
                      };
                      return (
                        <div className="row g-2 align-items-center" key={`m-${m.id}`}>
                          <div className="col-12 col-md-4">
                            <input className="form-control" disabled={!editing} value={(editing ? editing.nome : m.nome) || ''} onChange={(e)=>setField({ nome: e.target.value })} />
                          </div>
                          <div className="col-12 col-md-4">
                            <input className="form-control" disabled={!editing} value={(editing ? editing.dosagem : (m.dosagem || '')) || ''} onChange={(e)=>setField({ dosagem: e.target.value })} />
                          </div>
                          <div className="col-12 col-md-3">
                            <input className="form-control" disabled={!editing} value={(editing ? editing.frequencia : (m.frequencia || '')) || ''} onChange={(e)=>setField({ frequencia: e.target.value })} />
                          </div>
                          <div className="col-12 col-md-auto d-flex gap-2">
                            {!editing ? (
                              <>
                                <button type="button" className="btn btn-outline-primary" onClick={startEdit}>Editar</button>
                                <button type="button" className="btn btn-outline-danger" onClick={remove} disabled={isSaving}>Remover</button>
                              </>
                            ) : (
                              <>
                                <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={isSaving}>Salvar</button>
                                <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isSaving}>Cancelar</button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="row g-2 align-items-center">
                      <div className="col-12 col-md-4">
                        <input className="form-control" placeholder="Nome" value={newMed.nome} onChange={(e)=>setNewMed((s)=>({ ...s, nome: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-4">
                        <input className="form-control" placeholder="Dosagem" value={newMed.dosagem} onChange={(e)=>setNewMed((s)=>({ ...s, dosagem: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-3">
                        <input className="form-control" placeholder="Frequência" value={newMed.frequencia} onChange={(e)=>setNewMed((s)=>({ ...s, frequencia: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-auto">
                        <button type="button" className="btn btn-primary" onClick={async ()=>{
                          setOpErrMed('');
                          const data = { nome: newMed.nome, dosagem: newMed.dosagem || undefined, frequencia: newMed.frequencia || undefined };
                          const action = await dispatch(createMedicacao({ cpf, data }));
                          if (createMedicacao.rejected.match(action)) {
                            setOpErrMed(formatApiError(action.payload || action.error || 'Erro ao adicionar medicação'));
                          } else {
                            setNewMed({ nome: '', dosagem: '', frequencia: '' });
                            dispatch(fetchPatientDetails(cpf));
                          }
                        }} disabled={!newMed.nome}>+ Adicionar medicação</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alergias */}
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Alergias</h5>
                  {opErrAle && <div className="alert alert-danger py-2">{opErrAle}</div>}
                  <div className="d-grid gap-2">
                    {(patient?.alergias || []).map((a) => {
                      const editing = editAle[a.id] ?? null;
                      const isSaving = savingIds.has(`ale-${a.id}`);
                      const startEdit = () => setEditAle((map) => ({ ...map, [a.id]: { agente: a.agente, severidade: a.severidade || '' } }));
                      const cancelEdit = () => setEditAle((map) => { const { [a.id]: _, ...rest } = map; return rest; });
                      const setField = (patch) => setEditAle((map) => ({ ...map, [a.id]: { ...map[a.id], ...patch } }));
                      const saveEdit = async () => {
                        setOpErrAle('');
                        setSavingIds((s)=>new Set(s).add(`ale-${a.id}`));
                        try {
                          const payload = editing;
                          const changes = {};
                          if (payload.agente !== a.agente) changes.agente = payload.agente;
                          if ((payload.severidade || '') !== (a.severidade || '')) changes.severidade = payload.severidade || null;
                          if (Object.keys(changes).length === 0) { cancelEdit(); return; }
                          const action = await dispatch(updateAlergia({ id: a.id, changes }));
                          if (updateAlergia.rejected.match(action)) {
                            setOpErrAle(formatApiError(action.payload || action.error || 'Erro ao atualizar alergia'));
                          } else {
                            await dispatch(fetchPatientDetails(cpf));
                            cancelEdit();
                          }
                        } finally {
                          setSavingIds((s)=>{ const ns = new Set(s); ns.delete(`ale-${a.id}`); return ns; });
                        }
                      };
                      const remove = async () => {
                        setOpErrAle('');
                        setSavingIds((s)=>new Set(s).add(`ale-${a.id}`));
                        try {
                          const action = await dispatch(deleteAlergia({ id: a.id, cpf }));
                          if (deleteAlergia.rejected.match(action)) {
                            setOpErrAle(formatApiError(action.payload || action.error || 'Erro ao remover alergia'));
                          } else {
                            await dispatch(fetchPatientDetails(cpf));
                          }
                        } finally {
                          setSavingIds((s)=>{ const ns = new Set(s); ns.delete(`ale-${a.id}`); return ns; });
                        }
                      };
                      return (
                        <div className="row g-2 align-items-center" key={`a-${a.id}`}>
                          <div className="col-12 col-md-6">
                            <input className="form-control" disabled={!editing} value={(editing ? editing.agente : a.agente) || ''} onChange={(e)=>setField({ agente: e.target.value })} />
                          </div>
                          <div className="col-12 col-md-4">
                            <input className="form-control" disabled={!editing} value={(editing ? editing.severidade : (a.severidade || '')) || ''} onChange={(e)=>setField({ severidade: e.target.value })} />
                          </div>
                          <div className="col-12 col-md-auto d-flex gap-2">
                            {!editing ? (
                              <>
                                <button type="button" className="btn btn-outline-primary" onClick={startEdit}>Editar</button>
                                <button type="button" className="btn btn-outline-danger" onClick={remove} disabled={isSaving}>Remover</button>
                              </>
                            ) : (
                              <>
                                <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={isSaving}>Salvar</button>
                                <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isSaving}>Cancelar</button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="row g-2 align-items-center">
                      <div className="col-12 col-md-6">
                        <input className="form-control" placeholder="Agente" value={newAle.agente} onChange={(e)=>setNewAle((s)=>({ ...s, agente: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-4">
                        <input className="form-control" placeholder="Severidade" value={newAle.severidade} onChange={(e)=>setNewAle((s)=>({ ...s, severidade: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-auto">
                        <button type="button" className="btn btn-primary" onClick={async ()=>{
                          setOpErrAle('');
                          const data = { agente: newAle.agente, severidade: newAle.severidade || undefined };
                          const action = await dispatch(createAlergia({ cpf, data }));
                          if (createAlergia.rejected.match(action)) {
                            setOpErrAle(formatApiError(action.payload || action.error || 'Erro ao adicionar alergia'));
                          } else {
                            setNewAle({ agente: '', severidade: '' });
                            dispatch(fetchPatientDetails(cpf));
                          }
                        }} disabled={!newAle.agente}>+ Adicionar alergia</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditPatientModal;
