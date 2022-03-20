import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PageLayout from '../../components/PageLayout';
import PaginatedList from '../../components/PaginatedList';

export default function Explore() {
    return (
        <PageLayout>
            <Container maxWidth="lg" sx={{ justifyContent: 'center', pb: 1 }}>
                <Typography variant={'h2'}>Explore Iamus</Typography>
                <Typography variant={'body1'}>
                    Here you can explore content on Iamus, find the latest posts, reviews, users here.
                </Typography>
                <PaginatedList take={50} />
            </Container>
        </PageLayout>
    );
}
