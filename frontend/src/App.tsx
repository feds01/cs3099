import AppliedRoute from './components/AppliedRoute';
import ErrorContainer from './components/ErrorContainer';
import NotificationDisplay from './components/Notification';
import PrivateRoute from './components/PrivateRoute';
import * as routeConfig from './config/routes';
import { AuthProvider } from './hooks/auth';
import { NotificationProvider } from './hooks/notification';
import LoginRoute from './routes/Auth/Login';
import RegisterRoute from './routes/Auth/Register';
import SessionRoute from './routes/Auth/Session';
import SingleSignOnRoute from './routes/Auth/SingleSignOn';
import NotFoundRoute from './routes/NotFound';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type {} from '@mui/lab/themeAugmentation';
import { ReactElement } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// API querying client.
const queryCache = new QueryCache();
const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
        queries: {
            retry: 0,
            enabled: false,
            refetchOnWindowFocus: false,
        },
    },
});

// The application theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#0076FF',
        },
        secondary: {
            main: '#37123C',
        },
        text: {
            primary: '#303035',
            secondary: '#303035',
        },
    },
    typography: {
        fontSize: 12,
        fontFamily: [
            'Noto Sans',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        button: {
            textTransform: 'none',
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },

    components: {
        MuiTimelineItem: {
            styleOverrides: {
                root: {
                    '&:before': {
                        display: 'none',
                    },
                },
            }
        },
        MuiButton: {
            defaultProps: {
                disableRipple: true,
                disableElevation: true,
                variant: 'contained',
                size: 'small',
                sx: {
                    fontWeight: 'bold',
                },
            },
        },
    },
});

function App(): ReactElement {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ThemeProvider theme={theme}>
                    <NotificationProvider>
                        <NotificationDisplay>
                            <Router>
                                <Switch>
                                    <AppliedRoute exact path={'/login'} component={LoginRoute} />
                                    <AppliedRoute exact path={'/register'} component={RegisterRoute} />
                                    <AppliedRoute exact path={'/login/sso'} component={SingleSignOnRoute} />
                                    <AppliedRoute exact path={'/auth/session'} component={SessionRoute} />
                                    <Route>
                                        <ErrorContainer>
                                            <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
                                                <CssBaseline />
                                                <Switch>
                                                    {Object.entries(routeConfig.routes).map(([path, config]) => {
                                                        return <PrivateRoute key={path} path={path} {...config} />;
                                                    })}
                                                    {routeConfig.redirects.map((redirect, index) => {
                                                        return <Redirect exact strict {...redirect} key={index} />;
                                                    })}
                                                    <AppliedRoute exact path={'*'} component={NotFoundRoute} />
                                                </Switch>
                                            </Box>
                                        </ErrorContainer>
                                    </Route>
                                </Switch>
                            </Router>
                        </NotificationDisplay>
                    </NotificationProvider>
                </ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
