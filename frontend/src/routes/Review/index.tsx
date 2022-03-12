import ErrorBanner from '../../components/ErrorBanner';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../contexts/auth';
import { useNotificationDispatch } from '../../contexts/notification';
import { ReviewProvider } from '../../contexts/review';
import DeleteReviewForm from '../../forms/DeleteReviewForm';
import { ApiErrorResponse, GetReviewId200 as GetReviewResponse, GetReviewIdComments200 } from '../../lib/api/models';
import { Review, Comment } from '../../lib/api/models';
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
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { ReactElement, useEffect, useState } from 'react';
import { BiConversation, BiFile } from 'react-icons/bi';
import { Route, useLocation, useParams } from 'react-router';
import { Link, Switch } from 'react-router-dom';

interface TabMapProps {
    review: Review;
    comments: Comment[];
}

interface TabProps {
    label: string | React.ReactElement;
    icon?: React.ReactElement;
    component: () => React.ReactNode;
}

const FileTab: TabProps = {
    label: 'Files',
    icon: <BiFile size={16} />,
    component: () => <FileView />,
};

const TabMap = ({ review, comments }: TabMapProps): Record<string, TabProps> =>
    review.status === 'completed'
        ? {
              [`/review/${review.id}`]: {
                  label: (
                      <>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              Conversation
                          </Typography>
                          <Chip size="small" sx={{ ml: 0.5 }} label={comments.length} />
                      </>
                  ),
                  icon: <BiConversation size={16} />,
                  component: () => <ConversationView />,
              },
              [`/review/${review.id}/files`]: FileTab,
          }
        : {
              [`/review/${review.id}`]: FileTab,
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

    if (commentResourceResponse.state === 'loading' || reviewResponse.state === 'loading') {
        return (
            <PageLayout>
                <LinearProgress />
            </PageLayout>
        );
    } else if (commentResourceResponse.state === 'error' || reviewResponse.state === 'error') {
        return (
            <PageLayout>
                {commentResourceResponse.state === 'error' && (
                    <ErrorBanner message={commentResourceResponse.error.message} />
                )}
                {reviewResponse.state === 'error' && <ErrorBanner message={reviewResponse.error.message} />}
            </PageLayout>
        );
    }

    const { review } = reviewResponse.data;
    const { comments } = commentResourceResponse.data;
    const permission = computeUserPermission(review.owner.id, session);

    const tabMap = TabMap({
        review,
        comments,
    });

    return (
        <ReviewProvider state={{ comments, review, permission }} refetch={() => getCommentsQuery.refetch()}>
            <PageLayout>
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
                            {Object.entries(tabMap).map(([path, props]) => {
                                return (
                                    <Tab
                                        key={path}
                                        component={Link}
                                        to={path}
                                        value={path}
                                        sx={{
                                            height: '48px !important',
                                            minHeight: '48px',
                                            '&:hover': {
                                                color: (t) => t.palette.primary.main,
                                            },
                                        }}
                                        label={
                                            typeof props.label === 'string' ? (
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {props.label}
                                                </Typography>
                                            ) : (
                                                props.label
                                            )
                                        }
                                        {...(typeof props.icon !== 'undefined' && {
                                            icon: props.icon,
                                            iconPosition: 'start',
                                        })}
                                    />
                                );
                            })}
                        </Tabs>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
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
                            {Object.entries(tabMap).map(([path, props]) => {
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
            </PageLayout>
        </ReviewProvider>
    );
}
