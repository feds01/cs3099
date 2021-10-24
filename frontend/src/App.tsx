import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { AuthProvider } from './hooks/auth';
import LoginRoute from './routes/Auth/Login';
import * as routeConfig from './config/routes';
import AppliedRoute from './components/AppliedRoute';
import RegisterRoute from './routes/Auth/Register';
import PrivateRoute from './components/PrivateRoute';
import ErrorContainer from './components/ErrorContainer';

// API querying client.
const queryCache = new QueryCache();
const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
        queries: {
            retry: 0,
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
            primary: '#292E37',
            secondary: '#292E37',
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
        MuiButton: {
            defaultProps: {
                disableRipple: true,
                disableElevation: true,
            },
        },
    },
});

function App() {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <Router>
                        <Switch>
                            <AppliedRoute exact path={'/login'} component={LoginRoute} />
                            <AppliedRoute exact path={'/register'} component={RegisterRoute} />
                            <Route>
                                <ErrorContainer>
                                    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
                                        <CssBaseline />
                                        <Route>
                                            {Object.entries(routeConfig.routes).map(([path, config]) => {
                                                return <PrivateRoute key={path} path={path} {...config} />;
                                            })}
                                        </Route>
                                    </Box>
                                </ErrorContainer>
                            </Route>
                        </Switch>
                    </Router>
                </ThemeProvider>
            </QueryClientProvider>
        </AuthProvider>
    );
}

export default App;
