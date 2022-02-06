import TreeView from '../TreeView';
import Box from '@mui/material/Box';
import ErrorBanner from '../ErrorBanner';
import LoadingButton from '@mui/lab/LoadingButton';
import { ReviewProvider } from '../../hooks/review';
import { ContentState } from '../../types/requests';
import { ReactElement, useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useNotificationDispatch } from '../../hooks/notification';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import { useGetReviewIdComments, usePostReviewIdComplete } from '../../lib/api/reviews/reviews';
import { useGetPublicationUsernameNameAll } from '../../lib/api/publications/publications';
import {
    ApiErrorResponse,
    GetPublicationUsernameNameRevisionAll200,
    GetReviewIdComments200,
    Review,
} from '../../lib/api/models';
import SourceList from './SourceList';
import SubmissionPopOver from './SubmissionPopOver';

interface ReviewEditorProps {
    review: Review;
    refetchReview: () => void;
}

export default function ReviewEditor({ review, refetchReview }: ReviewEditorProps): ReactElement {
    const { publication, owner } = review;

    const notificationDispatcher = useNotificationDispatch();
    const fileQuery = useGetPublicationUsernameNameAll(
        publication.owner.username,
        publication.name,
        { revision: publication.revision }
    );

    const getCommentsQuery = useGetReviewIdComments(review.id);
    const completeReviewQuery = usePostReviewIdComplete();

    const [resourceResponse, setResourceResponse] = useState<
        ContentState<GetPublicationUsernameNameRevisionAll200, ApiErrorResponse>
    >({
        state: 'loading',
    });

    const [commentResourceResponse, setCommentResourceResponse] = useState<
        ContentState<GetReviewIdComments200, ApiErrorResponse>
    >({
        state: 'loading',
    });

    useEffect(() => {
        fileQuery.refetch();
        getCommentsQuery.refetch();
    }, [publication.id, owner.id]);

    useEffect(() => {
        setResourceResponse(transformQueryIntoContentState(fileQuery));
    }, [fileQuery.data, fileQuery.isLoading]);

    useEffect(() => {
        setCommentResourceResponse(transformQueryIntoContentState(getCommentsQuery));
    }, [getCommentsQuery.data, getCommentsQuery.isLoading]);

    useEffect(() => {
        if (!completeReviewQuery.isLoading && completeReviewQuery.data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully posted review' },
            });
            refetchReview();
        } else if (completeReviewQuery.isError && completeReviewQuery.error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: 'Failed to complete review' },
            });
        }
    }, [completeReviewQuery.isLoading, completeReviewQuery.data]);

    // For now we only want to refetch the comment as they're the only thing that can change.
    const refetchData = () => {
        getCommentsQuery.refetch();
    };

    // For the submit popover so a reviewer can leave a general comment on a review...
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // @@Hack: This is a very hacky way of displaying the state for both queries, we should fix this!
    if (commentResourceResponse.state === 'loading') {
        return <LinearProgress />;
    } else if (commentResourceResponse.state === 'error') {
        return <ErrorBanner message={commentResourceResponse.error.message} />;
    }

    switch (resourceResponse.state) {
        case 'loading': {
            return <LinearProgress />;
        }
        case 'error': {
            return <ErrorBanner message={resourceResponse.error.message} />;
        }
        case 'ok': {
            const { entries } = resourceResponse.data;
            const { comments } = commentResourceResponse.data;

            return (
                <ReviewProvider state={{ comments }} refetch={refetchData}>
                    <Box
                        sx={{
                            display: 'flex',
                            position: 'absolute',
                            overflowX: 'hidden',
                            overflowY: 'hidden',
                            flex: 1,
                            minWidth: 800,
                            flexDirection: 'row',
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                width: '30%',
                                maxWidth: 300,
                                position: 'relative',
                                borderRight: 1,
                                borderColor: 'divider',
                                overflowY: 'scroll',
                                overflowX: 'scroll',
                            }}
                        >
                            <TreeView comments={comments} paths={entries.map((entry) => entry.filename)} />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                flex: 1,
                                overflowY: 'scroll',
                                zIndex: 80,
                                mr: 1,
                                ml: 1,
                                pb: 4,
                            }}
                        >
                            <SourceList entries={entries} review={review} />
                        </Box>
                    </Box>
                    {review.status === 'started' && (
                        <Box
                            sx={{
                                display: 'flex',
                                position: 'fixed',
                                flexDirection: 'row',
                                border: 1,
                                borderColor: 'divider',
                                justifyContent: 'space-between',
                                background: '#fff',
                                width: 'calc(100% - 41px)', // @@Hack: we assume that the side bar size is always constant
                                bottom: 0,
                                zIndex: 100,
                            }}
                        >
                            <div></div>
                            <Box sx={{ p: 2 }}>
                                <LoadingButton
                                    variant="contained"
                                    loading={completeReviewQuery.isLoading}
                                    onClick={handleClick}
                                    endIcon={<ArrowDropUpIcon />}
                                >
                                    Finish review
                                </LoadingButton>
                            </Box>
                        </Box>
                    )}
                    <SubmissionPopOver
                        open={open}
                        review={review}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                        onSubmission={() => {
                            setAnchorEl(null);
                            completeReviewQuery.mutateAsync({ id: review.id });
                        }}
                    />
                </ReviewProvider>
            );
        }
    }
}
