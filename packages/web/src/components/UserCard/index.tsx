import { User } from '../../lib/api/models';
import UserAvatar from '../UserAvatar';
import UserLink from '../UserLink';
import { Card, CardContent, Skeleton, Typography, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';

interface UserCardProps {
    user: User;
}

export default function UserCard({ user }: UserCardProps): ReactElement {
    const theme = useTheme();

    return (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
                    <UserAvatar {...user} displayName={false} size={40} />
                    <Box sx={{ width: '100%', paddingLeft: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <Typography variant={'body1'}>{user.name}</Typography>
                            &nbsp;
                            <UserLink user={user} />
                        </Box>
                        <Typography variant={'body1'}>{user.status || user.about}</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export function UserCardSkeleton(): ReactElement {
    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
                    <Skeleton variant={'circular'} width={40} height={40} />
                    <Box sx={{ paddingLeft: 1, flex: 1 }}>
                        <Typography variant={'body1'}>
                            <Skeleton />
                        </Typography>
                        <Typography variant={'body1'}>
                            <Skeleton />
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
