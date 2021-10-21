import React from 'react';
import { Box } from '@mui/system';

import { Link, useHistory, useLocation } from 'react-router-dom';
import { User } from '../../lib/api/models';
import Typography from '@mui/material/Typography';
import LoginForm from '../../components/LoginForm';
import LoginCover from './../../static/images/login.svg';
import { useDispatchAuth } from '../../hooks/auth';

interface LocationState {
    from: { pathname: string };
}

// TODO: Support callbackUrl parameter... This involves forwarding the returned tokens
// and details from the server back to the callbackUrl. If the callbackUrl is specified,
// we should ignore the 'from' parameter (if it's provided).
function Login() {
    const authDispatcher = useDispatchAuth();

    // extract the 'from' part of the redirect if it's present. We use this path
    // to redirect the user back to where they tried to go.
    const location = useLocation<LocationState>();
    const history = useHistory();
    let { from } = location.state || { from: { pathname: '/' } };

    const handleSuccess = (session: User, token: string, refreshToken: string) => {
        authDispatcher({ type: 'login', data: {session, token, refreshToken }});
        history.push(from);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100%',
                width: '100%',
            }}
        >
            <Box
                sx={{
                    background: `url(${LoginCover}) no-repeat fixed center`,
                    backgroundSize: 'cover',
                    width: {
                        xs: 0,
                        sm: '35%',
                        md: '50%',
                    },
                    height: '100%',
                }}
            />
            <Box
                sx={{
                    display: 'flex',
                    height: '100%',
                    flex: 1,
                    maxWidth: 500,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingLeft: 2,
                    paddingRight: 2,
                }}
            >
                <Typography sx={{ marginBottom: 8 }} variant={'h4'}>
                    Login
                </Typography>
                <Typography variant={'h5'}>Login to your account</Typography>
                <Typography variant={'caption'}>
                    Publish scientific works, papers, review and checkout the most recent works in astronomy today.
                </Typography>
                <LoginForm onSuccess={handleSuccess} />
                <Typography variant="body1">
                    Don't have an account yet? <Link to={{ pathname: '/register', state: { from } }}>Join Iamus</Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default Login;
