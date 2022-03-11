import AppliedRoute from './components/AppliedRoute';
import ErrorContainer from './components/ErrorContainer';
import NotificationDisplay from './components/Notification';
import PrivateRoute from './components/PrivateRoute';
import * as routeConfig from './config/routes';
import { AuthProvider } from './contexts/auth';
import { NotificationProvider } from './contexts/notification';
import LoginRoute from './routes/Auth/Login';
import RegisterRoute from './routes/Auth/Register';
import SessionRoute from './routes/Auth/Session';
import SingleSignOnRoute from './routes/Auth/SingleSignOn';
import NotFoundRoute from './routes/NotFound';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type {} from '@mui/lab/themeAugmentation';
import { ReactElement } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Theme from './config/theme';

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

function App(): ReactElement {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ThemeProvider theme={Theme}>
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
