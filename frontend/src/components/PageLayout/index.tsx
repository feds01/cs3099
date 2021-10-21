import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React, { ReactElement } from 'react';
import Header from '../Header';

interface Props {
    children: React.ReactNode;
}

export default function PageLayout({ children }: Props): ReactElement {
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
            <Header />
            <Box component="main" sx={{ display: 'flex', flexGrow: 1 }}>
                <Container
                    sx={{
                        background: '#F5F6F5',
                        flexGrow: 1,
                        width: '100%',
                        padding: 0,
                    }}
                    maxWidth={false}
                >
                    {children}
                </Container>
            </Box>
        </Box>
    );
}
