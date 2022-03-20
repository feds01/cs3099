import ErrorBanner from '../components/ErrorBanner';
import ReviewCard from '../components/ReviewCard';
import SkeletonList from '../components/SkeletonList';
import {
    ApiErrorResponse,
    Publication,
    GetPublicationUsernameNameReviews200 as ReviewResponse,
} from '../lib/api/models';
import { useGetPublicationUsernameNameReviews as useGetReviews } from '../lib/api/reviews/reviews';
import VoidImage from '../static/images/void.svg';
import { ContentState } from '../types/requests';
import { transformQueryIntoContentState } from '../wrappers/react-query';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ReactElement, useEffect, useState } from 'react';

interface Props {
    publication: Publication;
}

export default function PublicationReviews({ publication }: Props): ReactElement {
    const { owner, name, revision } = publication;

    const getReviewsQuery = useGetReviews(owner.username, name, { revision });
    const [reviews, setReviews] = useState<ContentState<ReviewResponse, ApiErrorResponse>>({ state: 'loading' });

    useEffect(() => {
        setReviews(transformQueryIntoContentState(getReviewsQuery));
    }, [getReviewsQuery.data, getReviewsQuery.isLoading]);

    switch (reviews.state) {
        case 'loading':
            return <SkeletonList rows={6} />;
        case 'error':
            return <ErrorBanner message={reviews.error.message} />;
        case 'ok':
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {reviews.data.reviews.length === 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '100%',
                                pt: 2,
                            }}
                        >
                            <img src={VoidImage} height={96} width={96} alt={'nothing'} />
                            <Typography variant="body2">No reviews yet.</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1} columns={{ xs: 1, sm: 1, md: 1 }} sx={{ marginTop: '0.25rem' }}>
                            {reviews.data.reviews.map((review, index) => {
                                return (
                                    <Grid key={index} item xs={2} sm={3} md={3}>
                                        <ReviewCard review={review} />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Box>
            );
    }
}
