import ErrorBanner from '../components/ErrorBanner';
import SkeletonList from '../components/SkeletonList';
import { ApiErrorResponse, GetUserUsernameReviews200 as ReviewResponse } from '../lib/api/models';
import { ContentState } from '../types/requests';
import { transformQueryIntoContentState } from '../wrappers/react-query';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ReactElement, useEffect, useState } from 'react';
import ReviewList from '../components/ReviewList';
import { UseQueryResult } from 'react-query';

type ReviewsViewProps = {
    withTitle?: boolean;
    textual?: boolean;
    query: UseQueryResult<ReviewResponse, ApiErrorResponse>;
};

export default function Reviews({ withTitle = true, query, textual = false }: ReviewsViewProps): ReactElement {
    const [reviewsQueryResult, setReviewsQueryResult] = useState<ContentState<ReviewResponse, ApiErrorResponse>>({
        state: 'loading',
    });

    useEffect(() => {
        setReviewsQueryResult(transformQueryIntoContentState(query));
    }, [query.data, query.isLoading]);

    function renderContent() {
        switch (reviewsQueryResult.state) {
            case 'loading':
                return <SkeletonList rows={3} />;
            case 'error':
                return <ErrorBanner message={reviewsQueryResult.error.message} />;
            case 'ok':
                return <ReviewList textual={textual} reviews={reviewsQueryResult.data.reviews} />;
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
