import { z } from 'zod';
import { User } from '../lib/api/models';
import React, { Dispatch, FC, useContext, useReducer } from 'react';

export type AuthStateAction =
    | { type: 'login'; rememberUser: boolean; data: { session: User; token: string; refreshToken: string } }
    | { type: 'logout' }
    | { type: 'refresh' };

export type AuthState = {
    session: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoggedIn: boolean;
};

// Use a schema for validating the session schema.
const SessionSchema = z.object({
    id: z.string(),
    email: z.string(),
    username: z.string(),
    profilePictureUrl: z.string().optional(),
});

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
            // If the user specifies to remember the login, the we save the tokens into local storage, otherwise
            // we place the tokens into the session storage.
            if (action.rememberUser) {
                console.log(action.data);
                localStorage.setItem('token', action.data.token);
                localStorage.setItem('refreshToken', action.data.refreshToken);
                localStorage.setItem('session', JSON.stringify(action.data.session));
            } else {
                sessionStorage.setItem('token', action.data.token);
                sessionStorage.setItem('refreshToken', action.data.refreshToken);
                sessionStorage.setItem('session', JSON.stringify(action.data.session));
            }

            return { ...state, ...action.data, isLoggedIn: true };
        case 'logout':
            localStorage.clear();
            sessionStorage.clear();

            return { session: null, token: null, refreshToken: null, isLoggedIn: false };
        case 'refresh':
            // TODO: make a call to the token refresh endpoint
            return state;
    }
}

const initAuth = (state: AuthState): AuthState => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && refreshToken) {
        state.token = token;

        // TODO: verify token endpoint
        state.isLoggedIn = true;

        try {
            const session = localStorage.getItem('session');

            if (session) {
                const jsonSession = JSON.parse(session);

                // Attempt to validate the session using Zod
                const parsedSession = SessionSchema.parse(jsonSession);
                state.session = parsedSession;
            }

        } catch (e) {
            console.log('Session in localStorage was invalid');
        }
    }

    return state;
}

export const AuthProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState, initAuth);

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
