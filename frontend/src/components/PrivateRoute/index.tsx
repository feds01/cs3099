import React, { ReactElement } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../../hooks/auth';

export default function PrivateRoute({ component: C, ...rest }: RouteProps): ReactElement {
    const auth = useAuth();

    if (typeof C == 'undefined') {
        throw new Error('Component prop must be passed to a PrivateRoute.');
    }

    return (
        <Route
            {...rest}
            render={(props) =>
                auth.isLoggedIn ? (
                    <C {...props} />
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    );
}
