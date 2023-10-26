import React, { ReactElement } from 'react';
import { Route, RouteProps } from 'react-router-dom';

export default function AppliedRoute({ component: C, ...rest }: RouteProps): ReactElement {
    if (typeof C == 'undefined') {
        throw new Error('Component prop must be passed to a AppliedRoute.');
    }

    return <Route {...rest} render={(props) => <C {...props} />} />;
}
