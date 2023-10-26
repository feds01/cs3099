import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PageLayout from '../../components/PageLayout';
import PaginatedPublicationList from '../../components/PaginatedPublicationList';

export default function Explore() {
    return (
        <PageLayout>
            <Container maxWidth="lg" sx={{ justifyContent: 'center', pb: 1 }}>
                <Typography variant={'h2'}>Explore Iamus</Typography>
                <Typography variant={'body1'}>
                    Here you can explore content on Iamus, find the latest posts, reviews, users here.
                </Typography>
                <PaginatedPublicationList take={50} />
            </Container>
        </PageLayout>
    );
}
