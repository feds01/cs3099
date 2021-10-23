import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React, { ReactElement } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface Props {
    children: React.ReactNode;
    title: string;
    drawerWidth?: number;
    sidebar?: boolean;
}

export default function PageLayout({ children, drawerWidth = 180, title, sidebar = true }: Props): ReactElement {
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
                wordBreak: 'break-all',
            }}
        >
            <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1, height: 'inherit' }}>
                <Header title={title} />
                <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
                    {sidebar && <Sidebar />}
                    <Container
                        sx={{
                            background: '#F5F6F5',
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
