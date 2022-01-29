import TreeView from '../TreeView';
import FileViewer from '../FileViewer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ErrorBanner from '../ErrorBanner';
import { ContentState } from '../../types/requests';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { ReactElement, useEffect, useState } from 'react';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import { useGetPublicationUsernameNameRevisionAll } from '../../lib/api/publications/publications';
import {
    ApiErrorResponse,
    FileResponse,
    GetPublicationUsernameNameRevisionAll200,
    GetReviewIdComments200,
    Review,
    Comment,
} from '../../lib/api/models';
import { useNotificationDispatch } from '../../hooks/notification';
import { ReviewProvider, useReviewState } from '../../hooks/review';
import { useGetReviewIdComments, usePostReviewIdComplete } from '../../lib/api/reviews/reviews';
import Popover from '@mui/material/Popover';
import CommentEditor from '../CommentEditor';
import Typography from '@mui/material/Typography';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CommentCard from '../CommentCard';

interface ReviewEditorProps {
    review: Review;
    refetchReview: () => void;
}

interface CodeSourceListProps {
    entries: FileResponse[];
    review: Review;
}

function CodeSourceList({ entries, review }: CodeSourceListProps) {
    // we can get the comments from the current state
    const { comments } = useReviewState();
    const [generalComments, setGeneralComments] = useState<Comment[]>([]);
    const [fileCommentMap, setFileCommentMap] = useState<Map<string, Comment[]>>(new Map());

    useEffect(() => {
        const newMap = new Map<string, Comment[]>();
        const newGeneralComments: Comment[] = [];

        comments.forEach((comment) => {
            if (typeof comment.filename === 'undefined') {
                newGeneralComments.push(comment);
            } else if (newMap.has(comment.filename)) {
                const originalArr = newMap.get(comment.filename)!;

                newMap.set(comment.filename, [...originalArr, comment]);
            } else {
                newMap.set(comment.filename, [comment]);
            }
        });

        setFileCommentMap(newMap);
        setGeneralComments(newGeneralComments);
    }, [comments]);

    return (
        <Box sx={{ pb: 4 }}>
            {entries.map((entry, index) => {
                const fileComments = fileCommentMap.get(entry.filename);

                return (
                    <FileViewer
                        review={review}
                        key={entry.filename}
                        id={`file-${index}`}
                        filename={entry.filename}
                        contents={entry.contents}
                        comments={fileComments}
                    />
                );
            })}
            <Box sx={{ pt: 2 }}>
                {generalComments.map((comment) => {
                    return (
                        <Box key={comment.contents} sx={{ pt: 1, pb: 1 }}>
                            <CommentCard review={review} comment={comment} />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export default function ReviewEditor({ review, refetchReview }: ReviewEditorProps): ReactElement {
    const { publication, owner } = review;

    const notificationDispatcher = useNotificationDispatch();
    const fileQuery = useGetPublicationUsernameNameRevisionAll(
        publication.owner.username,
        publication.name,
        publication.revision,
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
                                mr: 1,
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
                                pb: 4,
                            }}
                        >
                            <CodeSourceList entries={entries} review={review} />
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
                                <Button
                                    disabled={completeReviewQuery.isLoading}
                                    onClick={handleClick}
                                    endIcon={<ArrowDropUpIcon />}
                                >
                                    {!completeReviewQuery.isLoading ? (
                                        'Submit'
                                    ) : (
                                        <CircularProgress variant="determinate" color="inherit" size={14} />
                                    )}
                                </Button>
                            </Box>
                        </Box>
                    )}
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                                Finish your review
                            </Typography>
                            <Typography variant={'body2'} sx={{ pb: 1 }}>
                                You can leave a general comment on the review
                            </Typography>
                            <CommentEditor
                                isModifying={false}
                                reviewId={review.id}
                                onClose={() => setAnchorEl(null)}
                                onSubmit={() => completeReviewQuery.mutateAsync({ id: review.id })}
                            />
                        </Box>
                    </Popover>
                </ReviewProvider>
            );
        }
    }
}
