import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
    name: 'loading',
    initialState: false,
    reducers: {
        showLoader: () => true,
        hideLoader: () => false,
    }
});

export const { showLoader, hideLoader } = loadingSlice.actions;

export default loadingSlice.reducer;