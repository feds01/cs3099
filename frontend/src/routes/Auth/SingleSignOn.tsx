import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useEffect, useState } from 'react';
import { z } from 'zod';
import ErrorBanner from '../../components/ErrorBanner';
import { ContentState } from '../../types/requests';
import LogoImage from './../../static/images/logos/logo.svg';

interface Props {}

type TeamEndpoints = {
    [key: string]: string;
};

// This is the JSON spec that stores all of the journal endpoints.
const teamEndpointSchema = 'https://gbs3.host.cs.st-andrews.ac.uk/cs3099-journals.json';
const teamName = 't06';
const initialEndpoints = { t15: 'http://localhost:8000' };

export default function SingleSignOn(props: Props): ReactElement {
    const [endpoints, setEndpoints] = useState<ContentState<TeamEndpoints, any>>({ state: 'loading' });

    const handleSelect = (url: string) => {
        console.log(url);

        // form transition here??
    };

    useEffect(() => {
        async function onLoad() {
            await fetch(teamEndpointSchema, {
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            })
                // .then((res) => res.json())
                .then((res) => {
                    let teamEndpoints: TeamEndpoints = {};

                    // Setup a Zod schema to catch all string keys with values being urls. The 'key'
                    // needs to be a identifier beginning with 't' and two digits. The 'value' needs
                    // to be a URL. If either conditions fail, then the entry isn't added to the
                    // team endpoints map.
                    Object.entries(res).forEach(([key, value]) => {
                        if (!key.match(/t\d{2}/)) return;

                        // @@Hack: we're filtering out ourselves essentially
                        if (key === teamName) return;

                        const url = z.string().url().safeParse(value);
                        if (!url.success) return;

                        teamEndpoints[key] = url.data;
                    });

                    // @@Temporary since we have hard-coded initial team endpoints (for testing).
                    setEndpoints({ state: 'ok', data: { ...initialEndpoints, ...teamEndpoints } });
                })
                .catch((res: unknown) => {
                    setEndpoints({ state: 'error', error: res });
                });
        }

        onLoad();
    }, []);

    switch (endpoints.state) {
        case 'error': {
            return (
                <Container>
                    <ErrorBanner message={endpoints.error?.message || 'Unknown error occurred.'} />
                </Container>
            );
        }
        case 'loading': {
            return (
                <Container>
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                    <Box>
                        <Skeleton height={80} />
                        <Skeleton height={80} />
                        <Skeleton height={80} />
                    </Box>
                </Container>
            );
        }
        case 'ok': {
            return (
                <Box sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <Container>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                            <img src={LogoImage} width={96} height={96}/>
                            <Typography variant="h4">Select a journal</Typography>
                            <Typography>Use an external service to log into Iamus</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                            <List>
                                {Object.entries(endpoints.data).map(([name, url]) => {
                                    return (
                                        <Paper key={name} variant="outlined">
                                            <ListItem>
                                                <ListItemButton onClick={() => handleSelect(url)}>
                                                    <ListItemText primary={name} />
                                                </ListItemButton>
                                            </ListItem>
                                        </Paper>
                                    );
                                })}
                            </List>
                        </Box>
                    </Container>
                </Box>
            );
        }
    }
}
