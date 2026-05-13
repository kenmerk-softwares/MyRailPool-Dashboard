import { createSlice } from "@reduxjs/toolkit";

const driverSlice = createSlice({
  name: "driver",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {
    setDrivers: (state, action) => {
      state.list = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setDrivers, setLoading } = driverSlice.actions;
export default driverSlice.reducer;
