import React from 'react'
import { AuthState } from '../../types/auth'

interface Props {
    authState: AuthState<Error>;
    setAuthState: (state: AuthState<Error>) => void;
}

export default function Register(_props: Props) {
    return (
        <div>
            Register Page        
        </div>
    )
}

