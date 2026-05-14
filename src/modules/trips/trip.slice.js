import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  loading: false,
};

const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {
    setTrips: (state, action) => {
      state.list = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setTrips, setLoading } = tripSlice.actions;
export default tripSlice.reducer;
