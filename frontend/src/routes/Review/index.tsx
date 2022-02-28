import ErrorBanner from '../../components/ErrorBanner';
import PageLayout from '../../components/PageLayout';
import DeleteReviewForm from '../../forms/DeleteReviewForm';
import { useAuth } from '../../hooks/auth';
import { useNotificationDispatch } from '../../hooks/notification';
import { ReviewProvider } from '../../hooks/review';
import { ApiErrorResponse, GetReviewId200 as GetReviewResponse, GetReviewIdComments200 } from '../../lib/api/models';
import { Review } from '../../lib/api/models';
import { useGetReviewId, useGetReviewIdComments, usePostReviewIdComplete } from '../../lib/api/reviews/reviews';
import { computeUserPermission } from '../../lib/utils/roles';
import { ContentState } from '../../types/requests';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import ConversationView from './modules/ConversationView';
import FileView from './modules/FileView';
import SubmissionPopOver from './modules/SubmissionPopOver';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ReactElement, useEffect, useState } from 'react';
import { Route, useLocation, useParams } from 'react-router';
import { Link, Switch } from 'react-router-dom';

interface TabMapProps {
    review: Review;
}

const TabMap = ({ review }: TabMapProps) =>
    review.status === 'completed'
        ? {
              [`/review/${review.id}`]: {
                  label: 'Conversation',
                  component: () => <ConversationView />,
              },
              [`/review/${review.id}/files`]: {
                  label: 'Files',
                  component: () => <FileView />,
              },
          }
        : {
              [`/review/${review.id}`]: {
                  label: 'Files',
                  component: () => <FileView />,
              },
          };

interface ReviewParams {
    id: string;
}

export default function ReviewPage(): ReactElement {
    const location = useLocation();
    const { session } = useAuth();
    const notificationDispatcher = useNotificationDispatch();
    const params = useParams<ReviewParams>();

    const getReview = useGetReviewId(params.id);
    const [reviewResponse, setReviewResponse] = useState<ContentState<GetReviewResponse, ApiErrorResponse>>({
        state: 'loading',
    });

    const completeReviewQuery = usePostReviewIdComplete();

    useEffect(() => {
        if (!completeReviewQuery.isLoading && completeReviewQuery.data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully posted review' },
            });

            // This is a hack to prevent us jumping from '/' in conversation view
            // and file view...
            window.history.replaceState(null, '', `/review/${params.id}/files`);

            getReview.refetch();
        } else if (completeReviewQuery.isError && completeReviewQuery.error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: 'Failed to complete review' },
            });
        }
    }, [completeReviewQuery.isLoading, completeReviewQuery.data]);

    // For the submit pop-over so a reviewer can leave a general comment on a review...
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    useEffect(() => {
        getReview.refetch();
    }, [params.id]);

    useEffect(() => {
        setReviewResponse(transformQueryIntoContentState(getReview));
    }, [getReview.data, getReview.isLoading]);

    const getCommentsQuery = useGetReviewIdComments(params.id);
    const [commentResourceResponse, setCommentResourceResponse] = useState<
        ContentState<GetReviewIdComments200, ApiErrorResponse>
    >({
        state: 'loading',
    });

    useEffect(() => {
        setCommentResourceResponse(transformQueryIntoContentState(getCommentsQuery));
    }, [getCommentsQuery.data, getCommentsQuery.isLoading]);

    // @@Hack: This is a very hacky way of displaying the state for both queries, we should fix this!
    if (commentResourceResponse.state === 'loading') {
        return <LinearProgress />;
    } else if (commentResourceResponse.state === 'error') {
        return (
            <PageLayout>
                <ErrorBanner message={commentResourceResponse.error.message} />
            </PageLayout>
        );
    }

    const renderContent = () => {
        switch (reviewResponse.state) {
            case 'loading': {
                return <LinearProgress />;
            }
            case 'error': {
                return <ErrorBanner message={reviewResponse.error.message} />;
            }
            case 'ok':
                const { review } = reviewResponse.data;
                const { comments } = commentResourceResponse.data;
                const permission = computeUserPermission(review.owner.id, session);

                return (
                    <ReviewProvider state={{ comments, review, permission }} refetch={() => getCommentsQuery.refetch()}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                borderLeft: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <Box
                                sx={{
                                    borderBottom: 1,
                                    background: '#fff',
                                    borderColor: 'divider',
                                    position: 'fixed',
                                    display: 'flex',
                                    pr: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: 'calc(100vw - 41px)',
                                    zIndex: '82',
                                }}
                            >
                                <Tabs value={location.pathname}>
                                    {Object.entries(TabMap({ review })).map(([path, props]) => {
                                        return (
                                            <Tab
                                                key={path}
                                                component={Link}
                                                to={path}
                                                value={path}
                                                label={props.label}
                                            />
                                        );
                                    })}
                                </Tabs>
                                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                    {permission.delete && <DeleteReviewForm reviewId={review.id} />}
                                    {review.status === 'started' && (
                                        <LoadingButton
                                            variant="contained"
                                            size="small"
                                            {...(permission.delete && { sx: { ml: 1 } })}
                                            loading={completeReviewQuery.isLoading}
                                            onClick={handleClick}
                                            disabled={comments.length === 0}
                                            endIcon={<ArrowDropDownIcon />}
                                        >
                                            Finish review
                                        </LoadingButton>
                                    )}
                                </Box>
                            </Box>
                            <Switch>
                                <Box sx={{ pt: '48px' }}>
                                    {Object.entries(TabMap({ review })).map(([path, props]) => {
                                        return <Route exact key={path} path={path} render={() => props.component()} />;
                                    })}
                                </Box>
                            </Switch>
                        </Box>
                        <SubmissionPopOver
                            open={open}
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
    };

    return <PageLayout>{renderContent()}</PageLayout>;
}
