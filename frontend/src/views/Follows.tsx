import Grid from '@mui/material/Grid';
import { useAuth } from '../hooks/auth';
import { ApiErrorResponse, User } from '../lib/api/models';
import { Container, Typography } from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';
import { ContentState } from '../types/requests';
import FollowerCard from '../components/FollowerCard';
import Astronaut from '../static/images/spacewalk.svg';
import { useGetUserUsernameFollowers, useGetUserUsernameFollowing } from '../lib/api/followers/followers';

interface Props {
    type: 'followers' | 'following';
    username: string;
}

export default function Follows({ type, username }: Props): ReactElement {
    const { session } = useAuth();
    const [followers, setFollowers] = useState<ContentState<User[], ApiErrorResponse>>({ state: 'loading' });

    // TODO(alex): Creating both queries is very unclean but because you can't call hooks
    //             in react conditionally, we have to create two instances of the hooks (lazy version)
    //             and call it on demand using the refetch...
    const followerQuery = useGetUserUsernameFollowers(username);
    const followingQuery = useGetUserUsernameFollowing(username);

    useEffect(() => {
        async function loadData() {
            if (type === 'followers') {
                await followerQuery.refetch();
            } else {
                await followingQuery.refetch();
            }
        }

        loadData();
    }, [username]);

    useEffect(() => {
        if (type === 'followers') {
            if (followerQuery.isError) {
                setFollowers({ state: 'error', error: followerQuery.error });
            } else if (followerQuery.data) {
                setFollowers({ state: 'ok', data: followerQuery.data.followers });
            }
        } else if (followingQuery.data) {
            setFollowers({ state: 'ok', data: followingQuery.data.followers });
        } else if (followingQuery.isError) {
            setFollowers({ state: 'error', error: followingQuery.error });
        }
    }, [followingQuery.data, followerQuery.data]);

    switch (followers.state) {
        case 'loading':
            return <>Loading</>;
        case 'error':
            return <>Something went wrong :(</>;
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
                                <FollowerCard key={follower.id} user={follower} />
                            </Grid>
                        );
                    })}
                </Grid>
            );
    }
}
