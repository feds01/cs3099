import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useEffect } from 'react';
import { Publication } from '../../../lib/api/models';
import PublicationReviews from '../../../views/PublicationReviews';
import { usePostPublicationUsernameNameRevisionReview as useCreateReview } from '../../../lib/api/reviews/reviews';
import { useHistory } from 'react-router';

interface Props {
    publication: Publication;
}

export default function Reviews({ publication }: Props): ReactElement {
    const history = useHistory();
    const { owner, name, revision } = publication;
    const createReviewQuery = useCreateReview();
    const createReview = () => createReviewQuery.mutate({ username: owner.username, name, revision });

    // If the review was successfully created, we re-direct the user
    // to their review page.
    useEffect(() => {
        if (createReviewQuery.data && !createReviewQuery.isLoading) {
            history.push({ pathname: `/review/${createReviewQuery.data.review.id}` });
        } else if (createReviewQuery.isError) {
            // @@TODO: send a notification that we failed to make a review using the notification API.
        }
    }, [createReviewQuery.data, createReviewQuery.isLoading]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="h4">Reviews</Typography>
                <Box>
                    <Button onClick={createReview}>Add a review</Button>
                </Box>
            </Box>
            <Divider />
            <PublicationReviews publication={publication} />
        </Box>
    );
}
