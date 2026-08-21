import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  medicalProfile: null,
  nearbyDentists: [],
  symptomResult: null,
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setPatientLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMedicalProfile: (state, action) => {
      state.medicalProfile = action.payload;
      state.loading = false;
    },
    setNearbyDentists: (state, action) => {
      state.nearbyDentists = action.payload;
      state.loading = false;
    },
    setSymptomResult: (state, action) => {
      state.symptomResult = action.payload;
    },
    setPatientError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setPatientLoading, setMedicalProfile, setNearbyDentists, setSymptomResult, setPatientError } = patientSlice.actions;
export default patientSlice.reducer;
