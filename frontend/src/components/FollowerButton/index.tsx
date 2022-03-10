import { useAuth } from '../../contexts/auth';
import { useNotificationDispatch } from '../../contexts/notification';
import { useGetUserUsernameFollow } from '../../lib/api/followers/followers';
import { deleteUserUsernameFollow, postUserUsernameFollow } from '../../lib/api/users/users';
import { ContentState } from '../../types/requests';
import Button from '@mui/material/Button';
import { ReactElement, useEffect, useState } from 'react';

interface Props {
    username: string;
}

type FollowState = {
    following: boolean;
    self: boolean;
    followUserQuery: typeof postUserUsernameFollow | typeof deleteUserUsernameFollow;
};

const getFollowQuery = (state: Omit<FollowState, 'followUserQuery'>) => {
    if (!state.following) {
        return postUserUsernameFollow;
    } else {
        return deleteUserUsernameFollow;
    }
};

export default function FollowerButton({ username }: Props): ReactElement {
    const auth = useAuth();
    const notificationDispatcher = useNotificationDispatch();
    const follow = useGetUserUsernameFollow(username);

    const [response, setResponse] = useState<ContentState<FollowState, Error>>({ state: 'loading' });

    const handleClick = async () => {
        if (response.state !== 'ok') return;

        const followResponse = await response.data.followUserQuery(username);

        // We need to refetch the follow state if they have changed it...
        if (followResponse.status === 'ok') {
            follow.refetch();
        } else {
            notificationDispatcher({ type: 'add', item: { severity: 'error', message: "Couldn't follow user" } });
        }
    };

    useEffect(() => {
        const state = {
            self: auth.session.username === username,
            following: follow.data?.following || false,
        };
        
        const query = getFollowQuery(state);
        setResponse({ state: 'ok', data: { ...state, followUserQuery: query } });
    }, [username, follow.data, auth.session.username]);

    if (response.state !== 'ok' || response.data.self) {
        return <></>;
    } else {
        return (
            <Button
                variant="contained"
                sx={{ fontWeight: 'bold' }}
                onClick={handleClick}
            >
                {response.data.following ? 'Unfollow' : 'Follow'}
            </Button>
        );
    }
}
