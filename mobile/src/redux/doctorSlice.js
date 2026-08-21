import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patients: [],
  pendingDiagnoses: [],
  stats: { totalPatients: 0, pendingReviews: 0, totalXrays: 0 },
  loading: false,
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setDoctorLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPatients: (state, action) => {
      state.patients = action.payload;
      state.loading = false;
    },
    setPendingDiagnoses: (state, action) => {
      state.pendingDiagnoses = action.payload;
      state.loading = false;
    },
    setDoctorStats: (state, action) => {
      state.stats = action.payload;
    },
  },
});

export const { setDoctorLoading, setPatients, setPendingDiagnoses, setDoctorStats } = doctorSlice.actions;
export default doctorSlice.reducer;
