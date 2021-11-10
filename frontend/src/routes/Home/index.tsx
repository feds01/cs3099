import { ReactElement } from 'react';
import Container from '@mui/material/Container';
import PageLayout from '../../components/PageLayout';
import { Box, Button, Divider, Typography } from '@mui/material';
import Publications from '../../views/Publications';
import { useAuth } from '../../hooks/auth';
import Reviews from '../../views/Reviews';

interface Props {}

export default function Home(props: Props): ReactElement {
    const auth = useAuth();

    return (
        <PageLayout title={'Home'}>
            <Container>
            <Box sx={{mt: 2}}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography variant={'h3'}>Publications</Typography>
                        <Box>
                            <Button
                                variant={'contained'}
                                size={'small'}
                                href="/publication/create"
                                sx={{ fontWeight: 'bold' }}
                            >
                                Create publication
                            </Button>
                        </Box>
                    </Box>
                    <Divider />
                    <Publications withTitle={false} user={auth.session} />
                </Box>
                <Box sx={{mt: 2}}>
                    <Typography variant={'h3'}>Reviews</Typography>
                    <Divider />
                    <Box>
                        <Reviews user={auth.session} withTitle={false} />
                    </Box>
                </Box>
            </Container>
        </PageLayout>
    );
}
