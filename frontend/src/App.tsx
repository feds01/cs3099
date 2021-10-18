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

// The width of the left hand-side drawer
const drawerWidth = 240;

function App() {
    const [authState, setAuthState] = useState<AuthState<Error>>({ state: 'loading' });

    useEffect(() => {
        async function onLoad() {
            try {
            } catch (e: any) {
                setAuthState({ state: 'error', error: e });
            }
        }

        onLoad();
    }, []);

    return (
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
                                        appProps={{authState, setAuthState}}
                                    />
                                )
                            })}

                        </PageLayout>
                    </Box>
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
