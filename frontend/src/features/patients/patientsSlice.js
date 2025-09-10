import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Base path proxied pelo CRA para o serviço de pacientes (definido em package.json)
const base = '/api/v1/pacientes';

export const fetchPatientByCpf = createAsyncThunk(
  'patients/fetchByCpf',
  async (cpf, { rejectWithValue }) => {
    try {
      const res = await fetch(`${base}/${cpf}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchPatientDetails = createAsyncThunk(
  'patients/fetchDetails',
  async (cpf, { rejectWithValue }) => {
    try {
      const res = await fetch(`${base}/${cpf}/details`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ cpf, changes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${base}/${cpf}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ===== Cirurgias =====
export const createCirurgia = createAsyncThunk(
  'patients/createCirurgia',
  async ({ cpf, data }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/pacientes/${cpf}/cirurgias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateCirurgia = createAsyncThunk(
  'patients/updateCirurgia',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/cirurgias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteCirurgia = createAsyncThunk(
  'patients/deleteCirurgia',
  async ({ id, cpf }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/cirurgias/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return { id, cpf };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ===== Medicações =====
export const createMedicacao = createAsyncThunk(
  'patients/createMedicacao',
  async ({ cpf, data }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/pacientes/${cpf}/medicacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateMedicacao = createAsyncThunk(
  'patients/updateMedicacao',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/medicacoes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteMedicacao = createAsyncThunk(
  'patients/deleteMedicacao',
  async ({ id, cpf }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/medicacoes/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return { id, cpf };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ===== Alergias =====
export const createAlergia = createAsyncThunk(
  'patients/createAlergia',
  async ({ cpf, data }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/pacientes/${cpf}/alergias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateAlergia = createAsyncThunk(
  'patients/updateAlergia',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/alergias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteAlergia = createAsyncThunk(
  'patients/deleteAlergia',
  async ({ id, cpf }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/v1/alergias/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return { id, cpf };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deletePatient = createAsyncThunk(
  'patients/delete',
  async (cpf, { rejectWithValue }) => {
    try {
      const res = await fetch(`${base}/${cpf}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return cpf;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchPatients = createAsyncThunk(
  'patients/fetchList',
  async (q = '', { rejectWithValue }) => {
    const url = q ? `${base}?q=${encodeURIComponent(q)}` : base;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState: {
    byCpf: {}, // { [cpf]: paciente }
    order: [],     // ordem de CPFs trazidos individualmente
    list: [],      // ordem de CPFs da listagem
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientByCpf.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPatientByCpf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const p = action.payload;
        state.byCpf[p.cpf] = p;
        if (!state.order.includes(p.cpf)) state.order.push(p.cpf);
      })
      .addCase(fetchPatientByCpf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchPatientDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPatientDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const p = action.payload;
        state.byCpf[p.cpf] = p; // inclui coleções
        if (!state.order.includes(p.cpf)) state.order.push(p.cpf);
      })
      .addCase(fetchPatientDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchPatients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const arr = action.payload || [];
        state.list = arr.map((p) => p.cpf);
        for (const p of arr) {
          // mescla dados leves
          state.byCpf[p.cpf] = { ...(state.byCpf[p.cpf] || {}), ...p };
        }
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        const p = action.payload;
        state.byCpf[p.cpf] = p;
        if (!state.order.includes(p.cpf)) state.order.push(p.cpf);
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const p = action.payload;
        state.byCpf[p.cpf] = { ...(state.byCpf[p.cpf] || {}), ...p };
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        const cpf = action.payload;
        delete state.byCpf[cpf];
        state.order = state.order.filter((x) => x !== cpf);
        state.list = state.list.filter((x) => x !== cpf);
      });
    // Observação: thunks de cirurgias/medicações/alergias não alteram `status` global
    // e o estado detalhado é atualizado via `fetchPatientDetails` após cada mutação.
  }
});

export default patientsSlice.reducer;
