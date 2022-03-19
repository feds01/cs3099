import { ReactElement, useState } from 'react';
import { Box } from '@mui/system';
import qs from 'query-string';
import Button from '@mui/material/Button';
import { User } from '../../lib/api/models';
import Typography from '@mui/material/Typography';
import { useDispatchAuth } from '../../contexts/auth';
import LoginForm from '../../forms/LoginForm';
import LoginCover from './../../static/images/login.svg';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { SsoQuerySchema } from '../../validators/ssoQuery';
import Divider from '@mui/material/Divider';

interface LocationState {
    from: { pathname: string };
}

interface Props {}

// Type denoting the state of SSO attempt
type SsoAttempt =
    | {
          attempt: false;
      }
    | {
          attempt: true;
          state: string;
          from: string;
          token: string;
          url: string;
      };

function Login(props: Props): ReactElement {
    const authDispatcher = useDispatchAuth();

    const [showSsoAgreement, setShowSsoAgreement] = useState<SsoAttempt>({ attempt: false });

    // extract the 'from' part of the redirect if it's present. We use this path
    // to redirect the user back to where they tried to go.
    const location = useLocation<LocationState>();
    const history = useHistory();
    let { from } = location.state || { from: { pathname: '/' } };

    const handleSuccess = (session: User, token: string, refreshToken: string, rememberUser: boolean) => {
        authDispatcher({ type: 'login', rememberUser, data: { session, token, refreshToken } });

        // It might be the case that we get a 'from' and 'state' parameter passed with this.
        const parsedQuery = qs.parse(location.search.replace(/^\?/, ''));
        const validator = SsoQuerySchema.safeParse(parsedQuery);

        if (validator.success) {
            const { state, from } = validator.data;

            const query = qs.stringify({ from: process.env.REACT_APP_SERVICE_URI, token, state });

            // Paths are stupid!
            const fromUrl = new URL(from);
            const url = new URL(`${fromUrl.pathname.replace(/\/+$/, '')}/api/sg/sso/callback?${query}`, from);

            setShowSsoAgreement({
                attempt: true,
                state,
                from,
                token,
                url: url.toString(),
            });
        } else {
            history.push(from);
        }
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
                {showSsoAgreement.attempt ? (
                    <>
                        <Box sx={{ pb: 2 }}>
                            <Typography sx={{ marginBottom: 1 }} variant={'h4'}>
                                Confirm authorisation
                            </Typography>
                            <Typography variant={'body1'}>
                                You're about to authorise a foreign journal to access your data.
                            </Typography>
                        </Box>

                        <Typography variant={'h5'}>
                            Journal: <code style={{ wordBreak: 'break-all' }}>{showSsoAgreement.from}</code>
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', pt: 2 }}>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{ m: 1 }}
                                color="success"
                                href={showSsoAgreement.url}
                            >
                                Agree
                            </Button>
                            <Button variant="outlined" size="small" sx={{ ml: 1, mr: 1 }} href={from.pathname}>
                                Cancel
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography sx={{ marginBottom: 8 }} variant={'h4'}>
                            Login
                        </Typography>
                        <Typography variant={'h5'}>Login to your account</Typography>
                        <Typography variant={'caption'}>
                            Publish scientific works, papers, review and checkout the most recent works in astronomy
                            today.
                        </Typography>
                        <LoginForm onSuccess={handleSuccess} />
                        <Typography variant="body1">
                            Don't have an account yet?{' '}
                            <Link style={{ color: 'blue' }} to={{ pathname: '/register', state: { from } }}>
                                Join Iamus
                            </Link>
                        </Typography>
                        <Box>
                            <Divider sx={{ mt: 2, mb: 2 }}>OR</Divider>

                            <Button
                                fullWidth
                                variant={'contained'}
                                color={'secondary'}
                                sx={{ fontWeight: 'bold' }}
                                onClick={() => history.push({ pathname: '/login/sso', state: { from } })}
                            >
                                Sign in with a journal
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default Login;
