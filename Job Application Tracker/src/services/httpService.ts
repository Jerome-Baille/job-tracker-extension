import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';
import { logout } from '../services/authService';
import { store } from '../store';
import { setUserAuthenticated } from '../redux/actions/authActions';
import { showLoader, hideLoader } from '../redux/reducers/loadingSlice';
import { StorageKeys } from '../interfaces';

// Create an axios instance
const instance = axios.create();

// Add a request interceptor
instance.interceptors.request.use(async (config) => {
    // Show loader
    store.dispatch(showLoader());

    // Get only the access token from storage since we don't need refresh token here
    const { JT_accessToken } = await new Promise<StorageKeys>((resolve) => {
        chrome.storage.sync.get(['JT_accessToken'], function (result) {
            resolve(result as StorageKeys);
        });
    });

    // If access token exists, add it to the request headers
    if (JT_accessToken) {
        config.headers.Authorization = `Bearer ${JT_accessToken}`;
    }
    
    return config;
}, (error) => {
    // Hide loader
    store.dispatch(hideLoader());

    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(response => {
    // Hide loader
    store.dispatch(hideLoader());

    return response;
}, async error => {
    const originalRequest = error.config;

    // If the response status is 403, attempt to refresh the token
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Get refresh token from storage
        const { JT_refreshTokenId } = await new Promise<StorageKeys>((resolve) => {
            chrome.storage.sync.get(['JT_refreshTokenId'], function (result) {
                resolve(result as StorageKeys);
            });
        });

        if (JT_refreshTokenId) {
            try {
                const response = await axios.post(`${API_ENDPOINTS.auth}/refresh`, { refreshTokenId: JT_refreshTokenId });

                // Store new access token in storage
                const { accessToken } = response.data;
                chrome.storage.sync.set({
                    'JT_accessToken': accessToken,
                    'JT_refreshTokenId': JT_refreshTokenId // Keep the same refresh token
                });

                // Update the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Retry the original request
                return instance(originalRequest);
            } catch (refreshError) {
                store.dispatch(setUserAuthenticated(false));
                logout();
            }
        }
    }

    // Hide loader
    store.dispatch(hideLoader());

    return Promise.reject(error);
});

export default instance;