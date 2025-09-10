import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { formatApiError } from '../../utils/formatError';

// Base do serviço de Consultas (porta 8002 exposta no docker-compose)
const API_BASE = (process.env.REACT_APP_CONSULTAS_URL || 'http://localhost:8002/api/v1');

export const fetchConsultasPorDia = createAsyncThunk(
  'consultas/fetchPorDia',
  async (dia, { rejectWithValue }) => {
    const url = `${API_BASE}/consultas?dia=${encodeURIComponent(dia)}`;
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

export const criarConsulta = createAsyncThunk(
  'consultas/criar',
  async ({ cpf, dia, hora, descricao, estado, observacoes }, { rejectWithValue }) => {
    const url = `${API_BASE}/pacientes/${cpf}/consultas`;
    const payload = { cpfPaciente: cpf, dia, hora, descricao, estado, observacoes };
    try {
      const res = await fetch(url, {
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

export const removerConsulta = createAsyncThunk(
  'consultas/remover',
  async (id, { rejectWithValue }) => {
    const url = `${API_BASE}/consultas/${id}`;
    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.detail || `Erro ${res.status}`);
      }
      return { id };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const consultasSlice = createSlice({
  name: 'consultas',
  initialState: {
    byId: {},          // { [id]: consulta }
    byDay: {},         // { [dia]: [id, id, ...] }
    status: 'idle',
    error: null,
    currentDay: null,
  },
  reducers: {
    setCurrentDay(state, action) {
      state.currentDay = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConsultasPorDia.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchConsultasPorDia.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const dia = action.meta.arg;
        const arr = action.payload || [];
        const ids = [];
        for (const c of arr) {
          state.byId[c.id] = c;
          ids.push(c.id);
        }
        // Ordena por hora ascendente (string HH:MM funciona lexicograficamente)
        ids.sort((a, b) => (state.byId[a].hora || '').localeCompare(state.byId[b].hora || ''));
        state.byDay[dia] = ids;
      })
      .addCase(fetchConsultasPorDia.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatApiError(action.payload || action.error.message);
      })
      .addCase(criarConsulta.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(criarConsulta.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const c = action.payload;
        state.byId[c.id] = c;
        const dia = c.dia;
        if (!state.byDay[dia]) state.byDay[dia] = [];
        if (!state.byDay[dia].includes(c.id)) state.byDay[dia].push(c.id);
        state.byDay[dia].sort((a, b) => (state.byId[a].hora || '').localeCompare(state.byId[b].hora || ''));
      })
      .addCase(criarConsulta.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatApiError(action.payload || action.error.message);
      })
      .addCase(removerConsulta.fulfilled, (state, action) => {
        const id = action.payload.id;
        const c = state.byId[id];
        if (c) {
          const dia = c.dia;
          state.byDay[dia] = (state.byDay[dia] || []).filter((x) => x !== id);
          delete state.byId[id];
        }
      });
  }
});

export const { setCurrentDay } = consultasSlice.actions;
export default consultasSlice.reducer;
