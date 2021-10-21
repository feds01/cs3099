import React, { Dispatch, FC, useContext, useReducer } from 'react';
import { User } from '../lib/api/models';

export type AuthStateAction =
    | { type: 'login'; data: {session: User; token: string; refreshToken: string }}
    | { type: 'logout' }
    | { type: 'refresh' };

export type AuthState = {
    session: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoggedIn: boolean;
};

const initialState: AuthState = {
    session: null,
    token: null,
    refreshToken: null,
    isLoggedIn: false,
};

export const AuthContext = React.createContext<{
    state: AuthState;
    dispatch: Dispatch<AuthStateAction>;
}>({
    state: initialState,
    dispatch: () => null,
});

export function authReducer(state: AuthState, action: AuthStateAction): AuthState {
    switch (action.type) {
        case 'login':
            // TODO: save session and tokens to local-storage
            return { ...state, ...action.data, isLoggedIn: true };
        case 'logout':
            // TODO: clear the session and the local storage
            return { session: null, token: null, refreshToken: null, isLoggedIn: false };
        case 'refresh':
            // TODO: make a call to the token refresh endpoint
            return state;
    }
}

export const AuthProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (typeof context === 'undefined') {
        throw new Error('Cannot use authentication state without AuthContext.');
    }

    return context.state;
};

export const useDispatchAuth = () => {
    const context = useContext(AuthContext);

    if (typeof context === 'undefined') {
        throw new Error('Cannot dispatch authentication state without AuthContext.');
    }

    return context.dispatch;
};
