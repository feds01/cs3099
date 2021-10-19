import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React, { useState, useEffect } from 'react';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { AuthState } from './types/auth';
import * as routeConfig from './config/routes';
import PageLayout from './components/PageLayout';
import AppliedRoute from './components/AppliedRoute';
import LoginRoute from './routes/auth/Login';
import RegisterRoute from './routes/auth/Register';
import PrivateRoute from './components/PrivateRoute';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// The width of the left hand-side drawer
const drawerWidth = 240;

const theme = createTheme({
    palette: {
        primary: {
            main: "#0076FF"
        },
        secondary: {
            main: "#37123C"
        }
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
            textTransform: 'none'
          }
      },
      breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        }
      },
      components: {
        MuiButton: {
            defaultProps: {
                disableRipple: true,
                disableElevation: true
            }
        }
      }
});

function App() {
    const [authState, setAuthState] = useState<AuthState<Error>>({ state: 'loading' });

    useEffect(() => {
        async function onLoad() {
            try {
                // TODO: token's exist?
            } catch (e: any) {
                setAuthState({ state: 'error', error: e });
            }
        }

        onLoad();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <AppliedRoute exact path={'/login'} appProps={{ authState, setAuthState }} component={LoginRoute} />
                    <AppliedRoute
                        exact
                        path={'/register'}
                        appProps={{ authState, setAuthState }}
                        component={RegisterRoute}
                    />
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
                                            appProps={{ authState, setAuthState }}
                                        />
                                    );
                                })}
                            </PageLayout>
                        </Box>
                    </Route>
                </Switch>
            </Router>
        </ThemeProvider>
    );
}

export default App;
