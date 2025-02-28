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
    console.log('Request interceptor triggered');
    // Show loader
    store.dispatch(showLoader());

    // Get only the access token from storage since we don't need refresh token here
    const { JT_accessToken } = await new Promise<StorageKeys>((resolve) => {
        chrome.storage.sync.get(['JT_accessToken'], function (result) {
            console.log('Tokens retrieved from storage:', result);
            resolve(result as StorageKeys);
        });
    });

    // If access token exists, add it to the request headers
    if (JT_accessToken) {
        config.headers.Authorization = `Bearer ${JT_accessToken}`;
        console.log('Authorization header set:', config.headers.Authorization);
    } else {
        console.log('No access token available, proceeding without authentication');
    }
    
    return config;
}, (error) => {
    console.log('Request interceptor error:', error);
    // Hide loader
    store.dispatch(hideLoader());

    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(response => {
    console.log('Response interceptor triggered');
    // Hide loader
    store.dispatch(hideLoader());

    return response;
}, async error => {
    console.log('Response interceptor error:', error);
    const originalRequest = error.config;

    // If the response status is 403, attempt to refresh the token
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
        console.log('403 error received, attempting token refresh');
        originalRequest._retry = true;

        // Get refresh token from storage
        const { JT_refreshTokenId } = await new Promise<StorageKeys>((resolve) => {
            chrome.storage.sync.get(['JT_refreshTokenId'], function (result) {
                console.log('Refresh token retrieved from storage:', result);
                resolve(result as StorageKeys);
            });
        });

        if (JT_refreshTokenId) {
            try {
                const response = await axios.post(`${API_ENDPOINTS.auth}/refresh`, { refreshTokenId: JT_refreshTokenId });
                console.log('Token refresh response:', response.data);

                // Store new access token in storage
                const { accessToken } = response.data;
                chrome.storage.sync.set({
                    'JT_accessToken': accessToken,
                    'JT_refreshTokenId': JT_refreshTokenId // Keep the same refresh token
                });

                // Update the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                console.log('Retrying original request with new token:', originalRequest.headers.Authorization);

                // Retry the original request
                return instance(originalRequest);
            } catch (refreshError) {
                console.log('Token refresh failed', refreshError);
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