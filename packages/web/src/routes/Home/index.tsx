import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { ReactElement, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../contexts/auth';
import { useGetReview } from '../../lib/api/reviews/reviews';
import Publications from '../../views/Publications';
import Reviews from '../../views/Reviews';
import UserFeed from '../../views/UserFeed';

export default function Home(): ReactElement {
    const theme = useTheme();
    const { session } = useAuth();
    const reviewsQuery = useGetReview({ asCollaborator: 'true', filterSelf: 'true', take: 20 });

    useEffect(() => {
        reviewsQuery.refetch();
    }, []);

    return (
        <PageLayout>
            <Grid container sx={{ p: 2 }}>
                <Grid item xs={12} lg={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            pt: 0,
                        }}
                    >
                        <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                            Recent Publications
                        </Typography>
                        <Button
                            variant={'contained'}
                            size={'small'}
                            href="/publication/create"
                            sx={{ fontWeight: 'bold' }}
                        >
                            Create
                        </Button>
                    </Box>
                    <Divider />
                    <Publications withTitle={false} asCollaborator user={session} textual limit={10} />
                </Grid>
                <Grid item xs={12} lg={7}>
                    <Box
                        sx={{
                            [theme.breakpoints.up('lg')]: { pr: 2, pl: 2 },
                            [theme.breakpoints.between('xs', 'lg')]: { pt: 1 },
                        }}
                    >
                        <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                            Follow Activity
                        </Typography>
                        <Divider />
                        <UserFeed />
                    </Box>
                </Grid>
                <Grid item xs={12} lg={3}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Recent Reviews
                    </Typography>
                    <Divider />
                    <Reviews withTitle={false} query={reviewsQuery} textual />
                </Grid>
            </Grid>
        </PageLayout>
    );
}
