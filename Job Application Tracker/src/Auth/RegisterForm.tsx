import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

// Services
import { register } from "../services/authService";
import { showToast } from '../services/toastService';

import { hideLoader, showLoader } from '../redux/reducers/loadingSlice';

// Styles
import './AuthStyle.css';

export const RegisterForm = () => {
    const dispatch = useDispatch();

    // Set up form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Handle form submission
    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        // Show loader
        dispatch(showLoader());

        try {
            await register(username, password);
            setErrorMessage(''); // Clear error message on successful login

            // Hide loader
            dispatch(hideLoader());

            // Display success toast
            showToast({
                type: 'success',
                message: `Account created for ${username}. Please login.`,
            });
        } catch (err: any) {
            console.error(err);
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
        <form onSubmit={handleRegister} className="auth-container">
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

            <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit">Register</button>
            {errorMessage && <p>{errorMessage}</p>}
        </form>
    );
}