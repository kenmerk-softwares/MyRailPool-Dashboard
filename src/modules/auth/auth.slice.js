import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  profile: null,
  role: null,
  permissions: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    setProfile: (state, action) => {
      state.profile = action.payload;
    },

    setRole: (state, action) => {
      state.role = action.payload;
    },

    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.role = null;
      state.permissions = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const {
  setUser,
  setProfile,
  setRole,
  setPermissions,
  setLoading,
  setError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;