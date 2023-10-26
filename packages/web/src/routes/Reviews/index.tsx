import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../contexts/auth';
import { useGetUserUsernameReviews } from '../../lib/api/users/users';
import Reviews from '../../views/Reviews';

export default function ReviewsPage() {
    const auth = useAuth();
    const getReviewsQuery = useGetUserUsernameReviews(auth.session.username);

    return (
        <PageLayout>
            <Container>
                <Box sx={{ pt: 2, pb: 2 }}>
                    <Typography variant={'h3'}>Reviews</Typography>
                    <Divider />
                    <Box>
                        <Reviews query={getReviewsQuery} withTitle={false} />
                    </Box>
                </Box>
            </Container>
        </PageLayout>
    );
}
