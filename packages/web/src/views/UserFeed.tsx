import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import EmptyFeedImage from '../static/images/empty.svg';
import ActivityCard from '../components/ActivityCard';
import ErrorBanner from '../components/ErrorBanner';
import { useGetActivity } from '../lib/api/activity/activity';
import { ApiErrorResponse, GetActivity200 } from '../lib/api/models';
import { ContentState } from '../types/requests';
import { transformQueryIntoContentState } from '../wrappers/react-query';
import { Loader } from '../components/Loader';

type UserFeedProps = {
    limit?: number;
};

export default function UserFeed({ limit = 50 }: UserFeedProps) {
    const [feedResponse, setFeedResponse] = useState<ContentState<GetActivity200, ApiErrorResponse>>({
        state: 'loading',
    });

    const activityFeedQuery = useGetActivity({ take: limit });

    // For whatever reason, this isn't being fetched automatically
    useEffect(() => {
        activityFeedQuery.refetch();
    }, []);

    useEffect(() => {
        setFeedResponse(transformQueryIntoContentState(activityFeedQuery));
    }, [activityFeedQuery.data, activityFeedQuery.isError]);

    switch (feedResponse.state) {
        case 'loading':
            return (
                <Box
                    sx={{
                        display: 'flex',
                        paddingTop: 1,
                        width: '100%',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <Loader loading color="dimgray" />
                </Box>
            );
        case 'error':
            return <ErrorBanner message={feedResponse.error.message} />;
        case 'ok':
            return (
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
                            <img src={EmptyFeedImage} height={128} width={128} alt={'nothing'} />
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
            );
    }
}
