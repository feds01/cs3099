import React from 'react';
import { Box } from '@mui/system';
import { AuthState } from '../../types/auth';

import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import LoginForm from '../../components/LoginForm';
import LoginCover from './../../static/images/login.svg';

interface Props {
    authState: AuthState<Error>;
    setAuthState: (state: AuthState<Error>) => void;
}

function Login(props: Props) {
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
                        md: '50%'
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
                    paddingRight: 2
                }}
            >
                <Typography sx={{ marginBottom: 8 }} variant={'h4'}>
                    Login
                </Typography>
                <Typography variant={'h5'}>Login to your account</Typography>
                <Typography variant={'caption'}>
                    Publish scientific works, papers, review and checkout the most recent works in astronomy today.
                </Typography>
                <LoginForm />
                <Typography variant="body1">
                    Don't have an account yet? <Link to="/register">Join Iamus</Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default Login;
