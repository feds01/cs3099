import React, { ReactElement } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { AuthState } from '../../types/auth';

interface Props extends RouteProps {
    appProps: {
        authState: AuthState<Error>;
        setAuthState: (state: AuthState<Error>) => void;
    };
}

export default function PrivateRoute({ component: C, appProps, ...rest }: Props): ReactElement {
    const isLoggedIn = appProps.authState.state === 'authenticated';

    if (typeof C == 'undefined') {
        throw new Error('Component prop must be passed to a PrivateRoute.');
    }

    return (
        <Route
            {...rest}
            render={(props) =>
                isLoggedIn ? (
                    <C {...props} {...appProps} />
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    );
}
