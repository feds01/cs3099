import React, { ReactElement } from 'react';
import Box from '@mui/material/Box';
import UserLink from '../UserLink';
import UserAvatar from '../UserAvatar';
import { User } from '../../lib/api/models';
import { Card, CardContent, Typography } from '@mui/material';

interface Props {
    user: User;
}

export default function FollowerCard({ user }: Props): ReactElement {
    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
                    <UserAvatar {...user} displayName={false} size={40} />
                    <Box sx={{ width: '100%', paddingLeft: 1 }}>
                        <Typography variant={'body1'}>
                            {user.firstName} {user.lastName}
                        </Typography>
                        <UserLink username={user.username} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
