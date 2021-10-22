import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React, { ReactElement } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface Props {
    children: React.ReactNode;
    title: string;
    drawerWidth?: number;
}

export default function PageLayout({ children, drawerWidth = 240, title }: Props): ReactElement {
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
            <Box component="main" sx={{ display: 'flex', flex: 1, height: 'inherit' }}>
                <Sidebar drawerWidth={drawerWidth} />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Header title={title} />
                    <Container
                        sx={{
                            background: '#F5F6F5',
                            flexGrow: 1,
                            padding: 0,
                        }}
                        maxWidth={false}
                    >
                        <Box
                            sx={{
                                margin: 2,
                            }}
                        >
                            {children}
                        </Box>
                    </Container>
                </Box>
            </Box>
        </Box>
    );
}
