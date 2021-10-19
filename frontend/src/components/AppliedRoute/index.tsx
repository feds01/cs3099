import React, { ReactElement } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { AuthState } from '../../types/auth';

interface Props extends RouteProps {
    appProps: {
        authState: AuthState<Error>;
        setAuthState: (state: AuthState<Error>) => void;
    };
}

export default function AppliedRoute({ component: C, appProps, ...rest }: Props): ReactElement {
    if (typeof C == 'undefined') {
        throw new Error('Component prop must be passed to a AppliedRoute.');
    }

    return <Route {...rest} render={(props) => <C {...props} {...appProps} />} />;
}
