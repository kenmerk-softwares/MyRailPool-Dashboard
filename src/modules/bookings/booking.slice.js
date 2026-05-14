import { createSlice } from "@reduxjs/toolkit";

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {
    setBookings: (state, action) => {
      state.list = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setBookings, setLoading } = bookingSlice.actions;
export default bookingSlice.reducer;
