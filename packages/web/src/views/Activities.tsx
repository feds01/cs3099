import ActivityCard from '../components/ActivityCard';
import ErrorBanner from '../components/ErrorBanner';
import SkeletonList from '../components/SkeletonList';
import { useGetUserUsernameFeed } from '../lib/api/activity/activity';
import { ApiErrorResponse, GetUserUsernameFeed200 } from '../lib/api/models';
import VoidImage from '../static/images/void.svg';
import { ContentState } from '../types/requests';
import { transformQueryIntoContentState } from '../wrappers/react-query';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ReactElement, useEffect, useState } from 'react';

interface ActivityViewProps {
    username: string;
    limit?: number;
    title: string;
}

export default function ActivityView({ title, username, limit = 20 }: ActivityViewProps): ReactElement {
    const [feedResponse, setFeedResponse] = useState<ContentState<GetUserUsernameFeed200, ApiErrorResponse>>({
        state: 'loading',
    });

    const activityFeedQuery = useGetUserUsernameFeed(username, { take: limit });

    useEffect(() => {
        setFeedResponse(transformQueryIntoContentState(activityFeedQuery));
    }, [activityFeedQuery.data, activityFeedQuery.isError]);

    switch (feedResponse.state) {
        case 'loading':
            return (
                <div>
                    <Typography variant="h4">{title}</Typography>
                    <Divider />
                    <Box
                        sx={{
                            display: 'flex',
                            paddingTop: 1,
                            width: '100%',
                            alignItems: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <SkeletonList rows={3} />
                    </Box>
                </div>
            );
        case 'error':
            return <ErrorBanner message={feedResponse.error.message} />;
        case 'ok':
            return (
                <div>
                    <Typography variant="h4">Activity</Typography>
                    <Divider />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {feedResponse.data.activities.length === 0 ? (
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
                                <Typography variant="body2">No activity yet.</Typography>
                            </Box>
                        ) : (
                            feedResponse.data.activities.map((activity, index, activities) => {
                                return (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                        withDivider={index < activities.length - 1}
                                    />
                                );
                            })
                        )}
                    </Box>
                </div>
            );
    }
}
