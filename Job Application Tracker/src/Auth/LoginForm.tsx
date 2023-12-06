import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUserAuthenticated } from '../redux/actions/authActions';

// Services
import { login } from "../services/authService";
import { showToast } from '../services/toastService';

import { hideLoader, showLoader } from '../redux/reducers/loadingSlice';

// Styles
import './AuthStyle.css';

export const LoginForm = () => {
    const dispatch = useDispatch();

    // Set up form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    // Handle form submission
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Show loader
        dispatch(showLoader());

        try {
            await login(username, password);
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
            setErrorMessage(err.response.data.message); // Set error message from server response

            // Hide loader
            dispatch(hideLoader());

            // Display error toast
            showToast({
                type: 'error',
                message: err.response.data.message,
            });
        }
    };


    return (
        <form onSubmit={handleLogin} className="auth-container">
            <input
                type="text"
                placeholder="Enter username"
                name="username"
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
            {errorMessage && <p>{errorMessage}</p>}
        </form>
    );
}