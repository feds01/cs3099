import Button from '@mui/material/Button';
import React, { ReactElement, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth';
import { useGetUserUsernameFollow } from '../../lib/api/users/users';
import { ContentState } from '../../types/requests';

interface Props {
    username: string;
}

type FollowState = { following: boolean; self: boolean };

export default function FollowerButton({ username }: Props): ReactElement {
    const auth = useAuth();
    const follow = useGetUserUsernameFollow(username);

    const [response, setResponse] = useState<ContentState<FollowState, Error>>({ state: 'loading' });

    useEffect(() => {
        if (auth.session.username === username) {
            setResponse({ state: 'ok', data: { self: true, following: false } });
        } else {
            if (follow.data) {
                setResponse({ state: 'ok', data: { self: false, following: follow.data.following } });
            }
        }
    }, [username, follow.data, auth.session.username]);

    if (response.state === 'loading' || response.state === 'error') {
        return <></>;
    } else {
        // Return nothing if we shouldn't render this button
        if (response.data.self) {
            return <></>;
        }

        return (
            <Button variant="contained" sx={{ fontWeight: 'bold' }}>
                {response.data.following ? 'Unfollow' : 'Follow'}
            </Button>
        );
    }
}
