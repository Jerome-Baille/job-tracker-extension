import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';
import { logout } from '../services/authService'
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

    // Get token and expiration date from storage
    const { JT_accessToken, JT_accessTokenExpireDate, JT_refreshToken, JT_refreshTokenExpireDate } = await new Promise<StorageKeys>((resolve) => {
        chrome.storage.sync.get(['JT_accessToken', 'JT_accessTokenExpireDate', 'JT_refreshToken', 'JT_refreshTokenExpireDate'], function (result) {
            resolve(result as StorageKeys);
        });
    });

    let accessToken = JT_accessToken;
    const accessTokenExpireDate = JT_accessTokenExpireDate;

    // If refresh token is missing or expired, logout the user
    if (!JT_refreshToken || new Date().getTime() > new Date(JT_refreshTokenExpireDate).getTime()) {
        console.log('Refresh token is missing or expired');
        store.dispatch(setUserAuthenticated(false));
        logout();

        // Hide loader
        store.dispatch(hideLoader());

        throw new Error('Refresh token is missing or expired');
    }

    // If token is expired, refresh it
    if (new Date().getTime() > new Date(accessTokenExpireDate).getTime()) {
        let refreshToken;

        // Wrap chrome.storage.sync.get in a Promise
        await new Promise<void>((resolve) => {
            chrome.storage.sync.get('JT_refreshToken', function (result) {
                refreshToken = result.JT_refreshToken;
                resolve();
            });
        });

        const response = await axios.post(`${API_ENDPOINTS.auth}/refresh`, { refreshToken });

        // Store new tokens in storage
        accessToken = response.data.accessToken;
        const { refreshToken: newRefreshToken, accessTokenExpireDate: newAccessTokenExpireDate, refreshTokenExpireDate, userId, userIdExpireDate } = response.data;
        chrome.storage.sync.set({
            'JT_accessToken': accessToken,
            'JT_accessTokenExpireDate': newAccessTokenExpireDate,
            'JT_refreshToken': newRefreshToken,
            'JT_refreshTokenExpireDate': refreshTokenExpireDate,
            'JT_userId': userId,
            'JT_userIdExpireDate': userIdExpireDate
        });
    }

    // Set token in headers
    config.headers.Authorization = `Bearer ${accessToken}`;
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
}, error => {
    // Hide loader
    store.dispatch(hideLoader());

    return Promise.reject(error);
});

export default instance;