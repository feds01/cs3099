import ErrorBanner from '../../components/ErrorBanner';
import PageLayout from '../../components/PageLayout';
import { ReviewProvider } from '../../hooks/review';
import { ApiErrorResponse, GetReviewId200 as GetReviewResponse, GetReviewIdComments200 } from '../../lib/api/models';
import { Review } from '../../lib/api/models';
import { useGetReviewId, useGetReviewIdComments } from '../../lib/api/reviews/reviews';
import { ContentState } from '../../types/requests';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import ConversationView from './modules/ConversationView';
import FileView from './modules/FileView';
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

const TabMap = ({ review }: TabMapProps) => ({
    [`/review/${review.id}`]: {
        label: 'Conversation',
        component: () => <ConversationView />,
    },
    [`/review/${review.id}/files`]: {
        label: 'Files',
        component: () => <FileView />,
    },
});

interface ReviewParams {
    id: string;
}

export default function ReviewPage(): ReactElement {
    const location = useLocation();
    const params = useParams<ReviewParams>();

    const getReview = useGetReviewId(params.id);
    const [reviewResponse, setReviewResponse] = useState<ContentState<GetReviewResponse, ApiErrorResponse>>({
        state: 'loading',
    });

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
        return <ErrorBanner message={commentResourceResponse.error.message} />;
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
                return (
                    <ReviewProvider
                        state={{ comments: commentResourceResponse.data.comments, review }}
                        refetch={() => getCommentsQuery.refetch()}
                    >
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
                                    mb: 2,
                                    background: '#fff',
                                    borderColor: 'divider',
                                    position: 'fixed',
                                    width: '100%',
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
                            </Box>
                            <Switch>
                                <Box sx={{ pt: '48px' }}>
                                    {Object.entries(TabMap({ review })).map(([path, props]) => {
                                        return <Route exact key={path} path={path} render={() => props.component()} />;
                                    })}
                                </Box>
                            </Switch>
                        </Box>
                    </ReviewProvider>
                );
        }
    };

    return <PageLayout title="Review">{renderContent()}</PageLayout>;
}
