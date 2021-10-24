import { Card, CardContent, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../lib/api/models';
import UserAvatar from '../UserAvatar';

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
                        <Link to={`/profile/${user.username}`}>
                            <Typography variant={'body1'}>
                                {user.firstName} {user.lastName}
                            </Typography>
                        </Link>
                        <Typography variant={'body2'}>@{user.username}</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
