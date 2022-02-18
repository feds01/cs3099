import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React, { ReactElement } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface Props {
    children: React.ReactNode;
    drawerWidth?: number;
    sidebar?: boolean;
}

export default function PageLayout({ children, drawerWidth = 180, sidebar = true }: Props): ReactElement {
    return (
        <Box
            sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                maxWidth: '100%',
                wordBreak: 'break-word',
            }}
        >
            <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1, height: 'inherit' }}>
                <Header />
                <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1, pt: 8 }}>
                    {sidebar && <Sidebar />}
                    <Container
                        sx={{
                            display: 'flex',
                            background: '#F5F6F5',
                            position: 'relative',
                            flexDirection: 'column',
                            flexGrow: 1,
                            p: '0 !important',
                        }}
                        maxWidth={false}
                    >
                        {children}
                    </Container>
                </Box>
            </Box>
        </Box>
    );
}
