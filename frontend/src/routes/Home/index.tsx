import React from 'react';
import { AuthState } from '../../types/auth';

interface Props {
    authState: AuthState<Error>;
    setAuthState: (state: AuthState<Error>) => void;
}

export default function Home(props: Props) {
    return <div>Home Page</div>;
}
