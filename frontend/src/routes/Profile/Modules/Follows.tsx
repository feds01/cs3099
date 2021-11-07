import { Container, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { ReactElement, useEffect, useState } from 'react';
import FollowerCard from '../../../components/FollowerCard';
import { useAuth } from '../../../hooks/auth';
import { User } from '../../../lib/api/models';
import { useGetUserUsernameFollowers, useGetUserUsernameFollowing } from '../../../lib/api/users/users';
import { ContentState } from '../../../types/requests';
import Astronaut from './../../../static/images/spacewalk.svg';

interface Props {
    type: 'followers' | 'following';
    username: string;
}

export default function Follows({ type, username }: Props): ReactElement {
    const { session } = useAuth();
    const [followers, setFollowers] = useState<ContentState<User[], any>>({ state: 'loading' });

    // TODO(alex): Creating both queries is very unclean but because you can't call hooks
    //             in react conditionally, we have to create two instances of the hooks (lazy version)
    //             and call it on demand using the refetch...
    const followerQuery = useGetUserUsernameFollowers(username, {
        query: {
            enabled: false,
        },
    });

    const followingQuery = useGetUserUsernameFollowing(username, {
        query: {
            enabled: false,
        },
    });

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
                setFollowers({ state: 'ok', data: followerQuery.data.data.followers });
            }
        } else if (followingQuery.data) {
            setFollowers({ state: 'ok', data: followingQuery.data.data.following });
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
                        <Box
                            sx={{
                                margin: 0,
                                width: 80,
                                height: 80,
                                background: `url(${Astronaut})`,
                            }}
                        />
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
