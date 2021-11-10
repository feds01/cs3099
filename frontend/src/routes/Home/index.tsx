import {ReactElement} from 'react';
import Container from '@mui/material/Container';
import PageLayout from '../../components/PageLayout';
import { Box, Button, Divider, Typography } from '@mui/material';
import PublicationList from './modules/PublicationList';
import ReviewsList from './modules/ReviewsList';

interface Props {}

export default function Home(props: Props): ReactElement {
    return (
        <PageLayout title={'Home'}>
            <Container sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <Box>
                    <PublicationList />
                </Box>
                <Typography variant={'h3'}>Reviews</Typography>
                <Divider />
                <Box>
                    <ReviewsList />
                </Box>
            </Container>
        </PageLayout>
    );
}
