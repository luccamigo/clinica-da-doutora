import React, { useState } from 'react';
import Modal from './Modal';
import { useDispatch, useSelector } from 'react-redux';
import { createPatient, fetchPatients } from '../features/patients/patientsSlice';
import { formatApiError } from '../utils/formatError';
import { normalizeCpf, maskCpf, CPF_REGEX } from '../utils/cpf';
import PatientLookupInput from './PatientLookupInput';
import { toISODate } from '../utils/date';

const initial = {
  cpf: '', nome_completo: '', data_nascimento: '', telefone: '', email: '', responsavel_cpf: '',
  cirurgias: [], medicacoes: [], alergias: []
};

const NewPatientModal = ({ open, onClose }) => {
  const [form, setForm] = useState(initial);
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const dispatch = useDispatch();
  const status = useSelector((s) => s.patients.status);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateCpf = (value, required = true) => {
    if (!value) return required ? 'CPF é obrigatório' : '';
    const digits = String(value).replace(/\D/g, '');
    return digits.length === 11 ? '' : 'CPF inválido';
  };

  const onCpfChange = (k) => (e) => {
    const masked = maskCpf(e.target.value);
    set(k, masked);
    setFieldErrors((fe) => ({ ...fe, [k]: validateCpf(masked, k === 'cpf') }));
  };

  // helpers arrays
  const addItem = (key, item) => setForm((f) => ({ ...f, [key]: [...f[key], item] }));
  const setItem = (key, idx, patch) => setForm((f) => ({
    ...f,
    [key]: f[key].map((it, i) => i === idx ? { ...it, ...patch } : it)
  }));
  const removeItem = (key, idx) => setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const cpf = normalizeCpf(form.cpf);
    const cpfErr = validateCpf(form.cpf, true);
    const respNorm = normalizeCpf(form.responsavel_cpf);
    const respErr = form.responsavel_cpf ? (respNorm ? '' : 'CPF inválido') : '';
    setFieldErrors({ cpf: cpfErr, responsavel_cpf: respErr });
    if (cpfErr || respErr) { setLocalError(cpfErr || respErr); return; }
    const payload = {
      cpf,
      nome_completo: form.nome_completo,
      data_nascimento: toISODate(form.data_nascimento) || undefined,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      responsavel_cpf: normalizeCpf(form.responsavel_cpf) || undefined,
      cirurgia: form.cirurgias.map(({ nome, data, observacoes }) => ({ nome, data: data || undefined, observacoes: observacoes || undefined })),
      medicacao: form.medicacoes.map(({ nome, dosagem, frequencia }) => ({ nome, dosagem: dosagem || undefined, frequencia: frequencia || undefined })),
      alergia: form.alergias.map(({ agente, severidade }) => ({ agente, severidade: severidade || undefined })),
    };
    try {
      const action = await dispatch(createPatient(payload));
      if (createPatient.fulfilled.match(action)) {
        setForm(initial);
        onClose && onClose();
        dispatch(fetchPatients(''));
      } else {
        setLocalError(formatApiError(action.payload || action.error || 'Erro ao cadastrar'));
      }
    } catch (err) {
      setLocalError(formatApiError(err));
    }
  };

  const footer = (
    <div>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      <button type="submit" form="form-novo-paciente" className="btn btn-primary" disabled={status==='loading'}>
        {status==='loading' ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Novo Paciente" footer={footer} width="48rem">
      <form id="form-novo-paciente" onSubmit={onSubmit}>
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="cpf" className="form-label">CPF</label>
              <input id="cpf" className={`form-control ${fieldErrors.cpf ? 'is-invalid' : ''}`} value={form.cpf} onChange={onCpfChange('cpf')} placeholder="000.000.000-00" />
              {fieldErrors.cpf && <div className="invalid-feedback d-block">{fieldErrors.cpf}</div>}
            </div>
            <div className="col-12">
              <label htmlFor="nome" className="form-label">Nome completo</label>
              <input id="nome" className="form-control" value={form.nome_completo} onChange={(e)=>set('nome_completo', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="nasc" className="form-label">Data de nascimento</label>
              <input id="nasc" type="date" className="form-control" value={form.data_nascimento} onChange={(e)=>set('data_nascimento', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="tel" className="form-label">Telefone</label>
              <input id="tel" className="form-control" value={form.telefone} onChange={(e)=>set('telefone', e.target.value)} />
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

            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Cirurgias</h5>
                  <div className="d-grid gap-2">
                    {form.cirurgias.map((c, i) => (
                      <div className="row g-2 align-items-center" key={`c${i}`}>
                        <div className="col-12 col-md-4">
                          <input className="form-control" placeholder="Nome" value={c.nome || ''} onChange={(e)=>setItem('cirurgias', i, { nome: e.target.value })} />
                        </div>
                        <div className="col-12 col-md-3">
                          <input className="form-control" type="date" placeholder="Data" value={c.data || ''} onChange={(e)=>setItem('cirurgias', i, { data: e.target.value })} />
                        </div>
                        <div className="col-12 col-md-4">
                          <input className="form-control" placeholder="Observações" value={c.observacoes || ''} onChange={(e)=>setItem('cirurgias', i, { observacoes: e.target.value })} />
                        </div>
                        <div className="col-12 col-md-auto">
                          <button type="button" className="btn btn-outline-danger" onClick={()=>removeItem('cirurgias', i)}>Remover</button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" className="btn btn-primary" onClick={()=>addItem('cirurgias', { nome: '', data: '', observacoes: '' })}>+ Adicionar cirurgia</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Medicações</h5>
                  <div className="d-grid gap-2">
                    {form.medicacoes.map((m, i) => (
                      <div className="row g-2 align-items-center" key={`m${i}`}>
                        <div className="col-12 col-md-4">
                          <input className="form-control" placeholder="Nome" value={m.nome || ''} onChange={(e)=>setItem('medicacoes', i, { nome: e.target.value })} />
                        </div>
                        <div className="col-12 col-md-4">
                          <input className="form-control" placeholder="Dosagem" value={m.dosagem || ''} onChange={(e)=>setItem('medicacoes', i, { dosagem: e.target.value })} />
                        </div>
                        <div className="col-12 col-md-3">
                          <input className="form-control" placeholder="Frequência" value={m.frequencia || ''} onChange={(e)=>setItem('medicacoes', i, { frequencia: e.target.value })} />
                        </div>
                        <div className="col-12 col-md-auto">
                          <button type="button" className="btn btn-outline-danger" onClick={()=>removeItem('medicacoes', i)}>Remover</button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" className="btn btn-primary" onClick={()=>addItem('medicacoes', { nome: '', dosagem: '', frequencia: '' })}>+ Adicionar medicação</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Alergias</h5>
                  <div className="d-grid gap-2">
                    {form.alergias.map((a, i) => (
                      <div className="row g-2 align-items-center" key={`a${i}`}>
                        <div className="col-12 col-md-6">
                          <input className="form-control" placeholder="Agente" value={a.agente || ''} onChange={(e)=>setItem('alergias', i, { agente: e.target.value })} />
                        </div>
                        <div className="col-12 col-md-4">
                          <input className="form-control" placeholder="Severidade" value={a.severidade || ''} onChange={(e)=>setItem('alergias', i, { severidade: e.target.value })} />
                        </div>
                        <div className="col-12 col-md-auto">
                          <button type="button" className="btn btn-outline-danger" onClick={()=>removeItem('alergias', i)}>Remover</button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" className="btn btn-primary" onClick={()=>addItem('alergias', { agente: '', severidade: '' })}>+ Adicionar alergia</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {localError && (
              <div className="col-12">
                <div className="alert alert-danger mb-0" role="alert">{localError}</div>
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewPatientModal;
