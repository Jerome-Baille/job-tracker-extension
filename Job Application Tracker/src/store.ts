import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './redux/reducers/authReducer';
import loadingReducer from './redux/reducers/loadingSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        loading: loadingReducer,
    },
});