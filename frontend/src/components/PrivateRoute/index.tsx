import { ReactElement } from 'react';
import { useRawAuth } from '../../contexts/auth';
import { Route, Redirect, RouteProps } from 'react-router-dom';

export default function PrivateRoute({ component: C, ...rest }: RouteProps): ReactElement {
    const auth = useRawAuth();

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
