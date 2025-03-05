import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

// Helper function to build the return URL

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.auth}/login`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    // Clear stored tokens
    chrome.storage.sync.remove([
      'JT_accessToken',
      'JT_accessTokenExpireDate',
      'JT_refreshTokenId',
      'JT_refreshTokenExpireDate',
      'JT_userId',
      'JT_userRoles',
      'JT_fingerprint'
    ]);
    
  } catch (error) {
    throw error;
  }
};

export const register = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.auth}/register`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to verify authentication with backend
export const verifyAuthentication = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.auth}/verif`);
    
    if (response.data.status === 'success' && response.data.mfaVerified) {
      // If verification is successful, get user tokens and store them
      const userResponse = await axios.get(`${API_ENDPOINTS.user}/me`);
      const { user, tokens } = userResponse.data;
      
      if (tokens) {
        const { accessToken, refreshTokenId, accessTokenExpireDate, refreshTokenExpireDate, fingerprint } = tokens;
        
        // Store tokens in storage
        chrome.storage.sync.set({
          'JT_accessToken': accessToken,
          'JT_accessTokenExpireDate': accessTokenExpireDate,
          'JT_refreshTokenId': refreshTokenId,
          'JT_refreshTokenExpireDate': refreshTokenExpireDate,
          'JT_userId': user.id,
          'JT_userRoles': user.roles,
          'JT_fingerprint': fingerprint
        });
      }
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to complete MFA login
export const completeMfaLogin = async (userId: string, token: string) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.auth}/complete-mfa-login`, {
      userId,
      token
    });
    
    if (response.data.status === 'success') {
      const { user, tokens } = response.data;
      const { accessToken, refreshTokenId, accessTokenExpireDate, refreshTokenExpireDate, fingerprint } = tokens;
      
      // Store tokens in storage
      chrome.storage.sync.set({
        'JT_accessToken': accessToken,
        'JT_accessTokenExpireDate': accessTokenExpireDate,
        'JT_refreshTokenId': refreshTokenId,
        'JT_refreshTokenExpireDate': refreshTokenExpireDate,
        'JT_userId': user.id,
        'JT_userRoles': user.roles,
        'JT_fingerprint': fingerprint
      });
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};