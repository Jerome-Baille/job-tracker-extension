interface Action {
    type: string;
    payload: boolean;
}

export const setUserAuthenticated = (isAuthenticated: boolean): Action => ({
    type: 'SET_USER_AUTHENTICATED',
    payload: isAuthenticated,
});