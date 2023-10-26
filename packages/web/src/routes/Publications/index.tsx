import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../contexts/auth';
import Publications from '../../views/Publications';

export default function PublicationsPage() {
    const auth = useAuth();

    return (
        <PageLayout>
            <Container>
                <Box sx={{ pt: 2, pb: 2 }}>
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
            </Container>
        </PageLayout>
    );
}
