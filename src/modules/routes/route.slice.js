import { createSlice } from "@reduxjs/toolkit";

const routeSlice = createSlice({
  name: "route",
  initialState: {
	list: [],
	loading: false,
  },
  reducers: {
	setRoutes: (state, action) => {
	  state.list = action.payload;
	},
	setLoading: (state, action) => {
	  state.loading = action.payload;
	},
  },
});

export const { setRoutes, setLoading } = routeSlice.actions;
export default routeSlice.reducer;
