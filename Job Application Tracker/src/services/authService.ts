import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_ENDPOINTS.auth}/login`, { username, password });

        const { accessToken, refreshTokenId, accessTokenExpireDate, refreshTokenExpireDate, userId, userIdExpireDate } = response.data;

        // Store tokens in storage
        chrome.storage.sync.set({
            'JT_accessToken': accessToken,
            'JT_accessTokenExpireDate': accessTokenExpireDate,
            'JT_refreshTokenId': refreshTokenId,
            'JT_refreshTokenExpireDate': refreshTokenExpireDate,
            'JT_userId': userId,
            'JT_userIdExpireDate': userIdExpireDate
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        // chrome.storage.sync.clear();

        chrome.storage.sync.remove([
            'JT_accessToken',
            'JT_accessTokenExpireDate',
            'JT_refreshTokenId',
            'JT_refreshTokenExpireDate',
            'JT_userId',
            'JT_userIdExpireDate'
        ]);
        
    } catch (error) {
        throw error;
    }
};

export const register = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_ENDPOINTS.auth}/register`, { username, password });

        return response.data;
    } catch (error) {
        throw error;
    }
}