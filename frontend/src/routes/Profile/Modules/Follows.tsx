import { Container, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { ReactElement, useEffect, useState } from 'react';
import FollowerCard from '../../../components/FollowerCard';
import { User } from '../../../lib/api/models';
import { ContentState } from '../../../types/requests';
import Astronaut from './../../../static/images/spacewalk.svg';

interface Props {
    type: 'followers' | 'following';
    id: string;
}

export default function Follows({ type, id }: Props): ReactElement {
    const [followers, setFollowers] = useState<ContentState<User[], Error>>({ state: 'loading' });

    useEffect(() => {
        setFollowers({ state: 'ok', data: [] });
    }, [id]);

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
                                ? 'You currently have no followers'
                                : "You're not following anyone yet"}
                        </Typography>
                    </Container>
                );
            }

            return (
                <Grid container spacing={1} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {followers.data.map((follower) => {
                        return (
                            <Grid item xs={2} sm={4} md={4}>
                                <FollowerCard key={follower.id} user={follower} />
                            </Grid>
                        );
                    })}
                </Grid>
            );
    }
}
