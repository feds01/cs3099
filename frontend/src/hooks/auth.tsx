import { z } from 'zod';
import { User } from '../lib/api/models';
import { usePostAuthSession } from '../lib/api/auth/auth';
import React, { Dispatch, FC, useContext, useEffect, useReducer } from 'react';

export type AuthStateAction =
    | { type: 'login'; rememberUser: boolean; data: { session: User; token: string; refreshToken: string } }
    | { type: 'data'; data: User }
    | { type: 'logout' };

export type AuthState = {
    session: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoggedIn: boolean;
};

export type VerifiedAuthState = {
    session: User;
    token: string | null;
    refreshToken: string | null;
    isLoggedIn: true;
};

// Use a schema for validating the session schema.
const SessionSchema = z.object({
    id: z.string(),
    email: z.string(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    status: z.string().optional(),
    about: z.string().optional(),
    profilePictureUrl: z.string().optional(),
    createdAt: z.number().nonnegative(),
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
                localStorage.setItem('token', action.data.token);
                localStorage.setItem('refreshToken', action.data.refreshToken);
                localStorage.setItem('session', JSON.stringify(action.data.session));
            } else {
                sessionStorage.setItem('token', action.data.token);
                sessionStorage.setItem('refreshToken', action.data.refreshToken);
                sessionStorage.setItem('session', JSON.stringify(action.data.session));
            }

            return { ...state, ...action.data, isLoggedIn: true };
        case 'data':
            localStorage.setItem('session', JSON.stringify(action.data));
            return { ...state, session: action.data };
        case 'logout':
            localStorage.clear();
            sessionStorage.clear();

            return { session: null, token: null, refreshToken: null, isLoggedIn: false };
    }
}

const initAuth = (state: AuthState): AuthState => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && refreshToken) {
        state.token = token;
        state.refreshToken = refreshToken;
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
};

export const AuthProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState, initAuth);
    const sessionQuery = usePostAuthSession();

    useEffect(() => {
        // Attempt to refresh tokens if there are tokens...
        if (state.isLoggedIn && state.refreshToken && state.token) {
            sessionQuery.mutate({
                data: {
                    token: state.token,
                    refreshToken: state.refreshToken,
                },
            });
        } else {
            dispatch({ type: 'logout' });
        }
    }, []);

    useEffect(() => {
        if (sessionQuery.data) {
            const { status, ...data } = sessionQuery.data;
            const { token, refreshToken } = data;
            dispatch({ type: 'login', rememberUser: true, data: { session: data.user, token, refreshToken } });
        } else if (sessionQuery.error) {
            // Hmm, couldn't refresh the tokens for whatever reason, so logout...
            dispatch({ type: 'logout' });
        }
    }, [sessionQuery.data, sessionQuery.error]);

    return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};

/**
 * Hook to get the raw user session with no assertion about if the user is really
 * logged in or not.
 *
 * @returns The current auth session
 */
export const useRawAuth = () => {
    const context = useContext(AuthContext);

    if (typeof context === 'undefined') {
        throw new Error('Cannot use authentication state without AuthContext.');
    }

    return context.state;
};

/**
 * Hook to get the authentication state of the current session. Unlike useAuthRaw(), this
 * guarantees that there exists a user session and that the user is logged in. This should
 * only be used when expecting the user to be logged in.
 *
 * @returns A verified user session.
 */
export const useAuth = (): VerifiedAuthState => {
    const state = useRawAuth();

    if (!state.isLoggedIn || !state.session) {
        throw new Error('Expected a user session, but had none.');
    }

    return {
        ...state,
        isLoggedIn: true,
        session: state.session,
    };
};

export const useDispatchAuth = () => {
    const context = useContext(AuthContext);

    if (typeof context === 'undefined') {
        throw new Error('Cannot dispatch authentication state without AuthContext.');
    }

    return context.dispatch;
};
