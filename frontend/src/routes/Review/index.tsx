import { useParams } from 'react-router';
import PageLayout from '../../components/PageLayout';
import ErrorBanner from '../../components/ErrorBanner';
import { ContentState } from '../../types/requests';
import ReviewEditor from '../../components/ReviewEditor';
import { ReactElement, useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import { useGetReviewId } from '../../lib/api/reviews/reviews';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import { ApiErrorResponse, GetReviewId200 as GetReviewResponse } from '../../lib/api/models';

interface ReviewParams {
    id: string;
}

export default function Review(): ReactElement {
    const params = useParams<ReviewParams>();

    const getReview = useGetReviewId(params.id);
    const [review, setReview] = useState<ContentState<GetReviewResponse, ApiErrorResponse>>({ state: 'loading' });

    useEffect(() => {
        getReview.refetch();
    }, [params.id]);

    useEffect(() => {
        setReview(transformQueryIntoContentState(getReview));
    }, [getReview.data, getReview.isLoading]);

    const renderContent = () => {
        switch (review.state) {
            case 'loading': {
                return <LinearProgress />;
            }
            case 'error': {
                return <ErrorBanner message={review.error.message} />;
            }
            case 'ok':
                const { publication, owner } = review.data.review;

                return <ReviewEditor publication={publication} owner={owner} />;
        }
    };

    // TODO: jump around sources
    // TODO: display comments
    // TODO: reply to comments
    // TODO: add comments (on file, on lines, general comment)
    // TODO: edit comment
    return <PageLayout title="Review">{renderContent()}</PageLayout>;
}
