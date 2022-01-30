import { z } from 'zod';
import qs from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatchAuth } from '../../hooks/auth';
import { ReactElement, useEffect, useState } from 'react';
import { usePostAuthSession } from '../../lib/api/auth/auth';


const SessionSchema = z.object({
    redirect: z.string(), // @@Cleanup: validate using regex for resource path?
    token: z.string(),
    refreshToken: z.string(),
});

export default function Session(): ReactElement {
    const history = useHistory();
    const location = useLocation();
    const sessionQuery = usePostAuthSession();
    const authDispatcher = useDispatchAuth();

    const [redirect, setRedirect] = useState<string | null>(null);

    useEffect(() => {
        // It might be the case that we get a 'from' and 'state' parameter passed with this.
        const parsedQuery = qs.parse(location.search.replace(/^\?/, ''));
        const validator = SessionSchema.safeParse(parsedQuery);

        // Redirect the user back to login if something wasn't correct with the user session.
        if (!validator.success) {
            history.push({ pathname: '/login' });
        } else {
            setRedirect(validator.data.redirect);
            sessionQuery.mutate({ data: validator.data }); // @@Cleanup: We shouldn't be passing 'redirect' into this type. But because typescript is dumb and doesn't consider this as  problem.
        }
    }, []);

    useEffect(() => {
        if (sessionQuery.data) {
            const { status, ...data } = sessionQuery.data;
            const { token, refreshToken } = data;
            authDispatcher({ type: 'login', rememberUser: true, data: { session: data.user, token, refreshToken } });

            // now we want to re-direct the user back to where they tried to initially go to...
            history.push({ pathname: redirect ?? '/' });
        }
    }, [sessionQuery.data]);

    return <div>Signing in...</div>;
}
