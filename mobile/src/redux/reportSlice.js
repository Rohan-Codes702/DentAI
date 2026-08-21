import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reports: [],
  activeDiagnosis: null,
  loading: false,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setReportLoading: (state, action) => {
      state.loading = action.payload;
    },
    setReports: (state, action) => {
      state.reports = action.payload;
      state.loading = false;
    },
    setActiveDiagnosis: (state, action) => {
      state.activeDiagnosis = action.payload;
    },
  },
});

export const { setReportLoading, setReports, setActiveDiagnosis } = reportSlice.actions;
export default reportSlice.reducer;
