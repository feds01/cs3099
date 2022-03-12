import React, { ReactElement } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { User } from '../../lib/api/models';
import { getUserInitials } from '../../lib/utils/user';

type NameDisplayProps = { displayName?: false; position?: never } | { displayName: true; position: 'right' | 'bottom' };

interface CommonProps {
    children?: React.ReactNode;
    size?: number;
}

type UserAvatarProps = User & CommonProps & NameDisplayProps;

export default function UserAvatar({
    children,
    displayName = false,
    size,
    position,
    username,
    name,
    profilePictureUrl,
}: UserAvatarProps): ReactElement {
    const initials = getUserInitials(name || username);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: position === 'right' ? 'row' : 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Avatar
                alt={username}
                {...(size && { sx: { width: size, height: size } })}
                {...(profilePictureUrl && { src: profilePictureUrl })}
                imgProps={{ crossOrigin: 'anonymous' }}
            >
                <Typography {...(size && { sx: { fontSize: size / 2 } })}>{initials}</Typography>
            </Avatar>
            {displayName && (
                <Typography sx={{ paddingLeft: position === 'right' ? 1 : 0 }} color="text" component="p">
                    {username}
                </Typography>
            )}
            {children}
        </Box>
    );
}
