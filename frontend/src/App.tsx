import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { AuthProvider } from './hooks/auth';
import LoginRoute from './routes/auth/Login';
import * as routeConfig from './config/routes';
import PageLayout from './components/PageLayout';
import AppliedRoute from './components/AppliedRoute';
import RegisterRoute from './routes/auth/Register';
import PrivateRoute from './components/PrivateRoute';

// The width of the left hand-side drawer
const drawerWidth = 240;

const theme = createTheme({
    palette: {
        primary: {
            main: '#0076FF',
        },
        secondary: {
            main: '#37123C',
        },
    },
    typography: {
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
            <ThemeProvider theme={theme}>
                <Router>
                    <Switch>
                        <AppliedRoute exact path={'/login'} component={LoginRoute} />
                        <AppliedRoute exact path={'/register'} component={RegisterRoute} />
                        <Route>
                            <Box sx={{ display: 'flex' }}>
                                <CssBaseline />
                                <Drawer
                                    sx={{
                                        width: drawerWidth,
                                        flexShrink: 0,
                                        '& .MuiDrawer-paper': {
                                            width: drawerWidth,
                                            boxSizing: 'border-box',
                                        },
                                    }}
                                    variant="permanent"
                                    anchor="left"
                                >
                                    <Toolbar />
                                    <Divider />
                                    Drawer!
                                </Drawer>
                                <PageLayout>
                                    {Object.keys(routeConfig.routes).map((path) => {
                                        return (
                                            <PrivateRoute
                                                key={path}
                                                path={path}
                                                {...routeConfig.routes[path as keyof routeConfig.Routes]}
                                            />
                                        );
                                    })}
                                </PageLayout>
                            </Box>
                        </Route>
                    </Switch>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
