import { configureStore } from '@reduxjs/toolkit';
import patientsReducer from '../features/patients/patientsSlice';
import consultasReducer from '../features/consultas/consultasSlice';

export const store = configureStore({
  reducer: {
    patients: patientsReducer,
    consultas: consultasReducer,
  },
});
