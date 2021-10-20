export type User = {
    email: string;
    name: string;
};

export type AuthState<E> = { state: 'loading' } | { state: 'authenticated'; data: User } | { state: 'error'; error: E };
