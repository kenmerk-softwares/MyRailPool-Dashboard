import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
    name: "request",
    initialState: {
        list: [],
        loading: false,
    },
    reducers: {
        setRequests: (state, action) => {
            state.list = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setRequests, setLoading } = requestSlice.actions;
export default requestSlice.reducer;
