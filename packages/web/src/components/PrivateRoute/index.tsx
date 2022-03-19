import { useRawAuth } from '../../contexts/auth';
import { User, UserRole } from '../../lib/api/models';
import NotFound from '../../routes/NotFound';
import { ReactElement } from 'react';
import { Route, Redirect, RouteProps, useLocation } from 'react-router-dom';

interface PermissionProps {
    minimumRole?: UserRole;
    permissionFn?: (session: User, pathname: string) => boolean;
}

export default function PrivateRoute({ component: C, ...rest }: RouteProps & PermissionProps): ReactElement {
    const auth = useRawAuth();
    const location = useLocation();

    if (typeof C == 'undefined') {
        throw new Error('Component prop must be passed to a PrivateRoute.');
    }

    return (
        <Route
            {...rest}
            render={(props) =>
                auth.isLoggedIn && auth.session ? (
                    typeof rest.permissionFn !== 'undefined' ? (
                        rest.permissionFn(auth.session, location.pathname) ? (
                            <C {...props} />
                        ) : (
                            <NotFound />
                        )
                    ) : (
                        <C {...props} />
                    )
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    );
}
