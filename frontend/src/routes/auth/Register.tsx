import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { Link } from 'react-router-dom';
import { AuthState } from '../../types/auth'
import AuthCover from './../../static/images/login.svg';
import RegisterForm from '../../components/RegisterForm';

interface Props {
    authState: AuthState<Error>;
    setAuthState: (state: AuthState<Error>) => void;
}

export default function Register(_props: Props) {
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
                    paddingRight: 2
                }}
            >
                <Typography sx={{ marginBottom: 8 }} variant={'h4'}>
                    Register
                </Typography>
                <Typography variant={'h5'}>Register an account</Typography>
                <Typography variant={'caption'}>
                    Publish scientific works, papers, review and checkout the most recent works in astronomy today.
                </Typography>
                <RegisterForm />
                <Typography variant="body1">
                    Already have an account yet? <Link to="/login">Log in</Link>
                </Typography>
            </Box>
        </Box>
    )
}

