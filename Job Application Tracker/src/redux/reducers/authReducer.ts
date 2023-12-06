interface State {
    isAuthenticated: boolean;
}

interface Action {
    type: string;
    payload?: boolean;
}

const initialState: State = {
    isAuthenticated: false,
};

export const authReducer = (state: State = initialState, action: Action): State => {
    switch (action.type) {
        case 'SET_USER_AUTHENTICATED':
            return { ...state, isAuthenticated: action.payload as boolean };
        default:
            return state;
    }
};