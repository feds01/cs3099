import { Box, Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import VoidImage from '../static/images/void.svg';
import ReviewCard from '../components/ReviewCard';
import { ReactElement, useEffect, useState } from 'react';
import { ContentState } from '../types/requests';
import ErrorBanner from '../components/ErrorBanner';
import SkeletonList from '../components/SkeletonList';
import { useGetUserUsernameReviews } from '../lib/api/users/users';
import { transformQueryIntoContentState } from '../wrappers/react-query';
import { ApiErrorResponse, GetUserUsernameReviews200 as ReviewResponse, User } from '../lib/api/models';

interface Props {
    user: User;
    withTitle?: boolean;
}

export default function Reviews({ user, withTitle = true }: Props): ReactElement {
    const getReviewsQuery = useGetUserUsernameReviews(user.username);
    const [reviews, setReviews] = useState<ContentState<ReviewResponse, ApiErrorResponse>>({ state: 'loading' });

    useEffect(() => {
        setReviews(transformQueryIntoContentState(getReviewsQuery));
    }, [getReviewsQuery.data]);

    function renderContent() {
        switch (reviews.state) {
            case 'loading':
                return (
                    <>
                        <SkeletonList rows={3} />
                    </>
                );
            case 'error':
                return <ErrorBanner message={reviews.error?.message || 'unknown error occurred.'} />;
            case 'ok':
                return (
                    <div>
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
                                <Grid
                                    container
                                    spacing={1}
                                    columns={{ xs: 1, sm: 1, md: 1 }}
                                    sx={{ marginTop: '0.25rem' }}
                                >
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
                    </div>
                );
        }
    }

    return (
        <>
            {withTitle && (
                <>
                    <Typography variant="h4">Reviews</Typography>
                    <Divider />
                </>
            )}
            {renderContent()}
        </>
    );
}
