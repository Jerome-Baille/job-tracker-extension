import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUserAuthenticated } from '../redux/actions/authActions';

// Services
import { login } from "../services/authService";
import { showToast } from '../services/toastService';

import { hideLoader, showLoader } from '../redux/reducers/loadingSlice';
import MfaVerification from './MfaVerification';

// Styles
import './AuthStyle.css';

export const LoginForm = () => {
    const dispatch = useDispatch();

    // Set up form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // MFA state
    const [showMfa, setShowMfa] = useState(false);
    const [userId, setUserId] = useState('');
    const [mfaUsername, setMfaUsername] = useState('');

    // Handle form submission
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Show loader
        dispatch(showLoader());

        try {
            const response = await login(username, password);
            
            // Check if MFA is required
            if (response.status === 'success' && response.requireMFA) {
                setShowMfa(true);
                setUserId(response.userId);
                setMfaUsername(response.username);
                dispatch(hideLoader());
                return;
            }
            
            dispatch(setUserAuthenticated(true));
            setErrorMessage(''); // Clear error message on successful login

            // Hide loader
            dispatch(hideLoader());

            // Display success toast
            showToast({
                type: 'success',
                message: `Welcome back, ${username}!`,
            });
        } catch (err: any) {
            console.error(err);
            dispatch(setUserAuthenticated(false));
            setErrorMessage(err.response?.data?.message || 'Login failed'); // Set error message from server response

            // Hide loader
            dispatch(hideLoader());

            // Display error toast
            showToast({
                type: 'error',
                message: err.response?.data?.message || 'Login failed',
            });
        }
    };

    const handleMfaCancel = () => {
        setShowMfa(false);
        setUserId('');
        setMfaUsername('');
        setUsername('');
        setPassword('');
    };

    if (showMfa) {
        return (
            <MfaVerification 
                userId={userId}
                username={mfaUsername}
                onCancel={handleMfaCancel}
            />
        );
    }

    return (
        <form onSubmit={handleLogin} className="auth-container">
            <input
                type="text"
                placeholder="Enter username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
        </form>
    );
}