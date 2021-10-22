import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { User } from '../../lib/api/models';
import { Link, useHistory, useLocation } from 'react-router-dom';
import AuthCover from './../../static/images/login.svg';
import RegisterForm from '../../components/RegisterForm';
import { useDispatchAuth } from '../../hooks/auth';

interface LocationState {
    from: { pathname: string };
}

export default function Register() {
    const authDispatcher = useDispatchAuth();

    // extract the 'from' part of the redirect if it's present. We use this path
    // to redirect the user back to where they tried to go.
    const location = useLocation<LocationState>();
    const history = useHistory();
    let { from } = location.state || { from: { pathname: '/' } };

    const handleSuccess = (session: User, token: string, refreshToken: string) => {
        authDispatcher({ type: 'login', rememberUser: true, data: { session, token, refreshToken } });
        history.push(from.pathname);
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
                    background: `url(${AuthCover}) no-repeat fixed center`,
                    backgroundSize: 'cover',
                    width: {
                        xs: 0,
                        sm: '35%',
                    },
                    height: '100%',
                }}
            />
            <Box
                sx={{
                    display: 'flex',
                    height: '100%',
                    flex: 1,
                    maxWidth: 800,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingLeft: 2,
                    paddingRight: 2,
                }}
            >
                <Typography sx={{ marginBottom: 8 }} variant={'h4'}>
                    Register
                </Typography>
                <Typography variant={'h5'}>Register an account</Typography>
                <Typography variant={'caption'}>
                    Publish scientific works, papers, review and checkout the most recent works in astronomy today.
                </Typography>
                <RegisterForm onSuccess={handleSuccess} />
                <Typography variant="body1">
                    Already have an account yet? <Link to="/login">Log in</Link>
                </Typography>
            </Box>
        </Box>
    );
}
