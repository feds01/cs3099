import ErrorBanner from '../components/ErrorBanner';
import UserCard, { UserCardSkeleton } from '../components/UserCard';
import { useAuth } from '../contexts/auth';
import { useGetUserUsernameFollowers, useGetUserUsernameFollowing } from '../lib/api/followers/followers';
import { ApiErrorResponse, User } from '../lib/api/models';
import Astronaut from '../static/images/spacewalk.svg';
import { ContentState } from '../types/requests';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ReactElement, useEffect, useState } from 'react';

interface Props {
    type: 'followers' | 'following';
    username: string;
}

const getFollowerQuery = (queryType: 'followers' | 'following') => {
    if (queryType === 'followers') {
        return useGetUserUsernameFollowers;
    } else {
        return useGetUserUsernameFollowing;
    }
};

export default function Follows({ type, username }: Props): ReactElement {
    const { session } = useAuth();
    const [followers, setFollowers] = useState<ContentState<User[], ApiErrorResponse>>({ state: 'loading' });

    const followerQuery = getFollowerQuery(type)(username);

    useEffect(() => {
        async function loadData() {
            await followerQuery.refetch();
        }

        loadData();
    }, [username]);

    useEffect(() => {
        if (followerQuery.isError) {
            setFollowers({ state: 'error', error: followerQuery.error });
        } else if (followerQuery.data) {
            setFollowers({ state: 'ok', data: followerQuery.data.followers });
        }
    }, [followerQuery.data]);

    switch (followers.state) {
        case 'loading':
            return (
                <Grid container spacing={1} columns={{ xs: 4, sm: 9, md: 12 }}>
                    {Array.apply(null, Array(4)).map((_, index) => (
                        <Grid key={index} item xs={2} sm={3} md={4} lg={3}>
                            <UserCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            );
        case 'error':
            return <ErrorBanner message={followers.error.message} />;
        case 'ok':
            if (followers.data.length === 0) {
                return (
                    <Container
                        maxWidth="sm"
                        component={'div'}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <img src={Astronaut} width={96} height={96} alt="nothing" />
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {type === 'followers'
                                ? session.username === username
                                    ? 'You currently have no followers'
                                    : `@${username} has no followers yet.`
                                : session.username === username
                                ? "You're not following anyone yet"
                                : `@${username} isn't following anyone yet`}
                        </Typography>
                    </Container>
                );
            }

            return (
                <Grid container spacing={1} columns={{ xs: 4, sm: 9, md: 12 }}>
                    {followers.data.map((follower) => {
                        return (
                            <Grid key={follower.username} item xs={2} sm={3} md={3}>
                                <UserCard key={follower.id} user={follower} />
                            </Grid>
                        );
                    })}
                </Grid>
            );
    }
}
