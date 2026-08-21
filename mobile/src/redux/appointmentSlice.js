import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  availableSlots: [],
  selectedAppointment: null,
  loading: false,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointmentLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAppointments: (state, action) => {
      state.appointments = action.payload;
      state.loading = false;
    },
    setAvailableSlots: (state, action) => {
      state.availableSlots = action.payload;
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.unshift(action.payload);
    },
    updateAppointmentStatus: (state, action) => {
      const { id, status } = action.payload;
      const appt = state.appointments.find(a => a._id === id || a.id === id);
      if (appt) {
        appt.status = status;
      }
    },
  },
});

export const { setAppointmentLoading, setAppointments, setAvailableSlots, setSelectedAppointment, addAppointment, updateAppointmentStatus } = appointmentSlice.actions;
export default appointmentSlice.reducer;
