import { User } from '../../lib/api/models';
import { getUserInitials } from '../../lib/utils/user';
import { SxProps, Theme, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';

type NameDisplayProps = { displayName?: false; position?: never } | { displayName: true; position: 'right' | 'bottom' };

interface CommonProps {
    children?: React.ReactNode;
    size?: number;
    sx?: SxProps<Theme>;
    className?: string;
}

type UserAvatarProps = User & CommonProps & NameDisplayProps;

type PureAvatarProps = {
    name?: string;
    username: string;
    size?: number;
    profilePictureUrl?: string;
    sx?: SxProps<Theme>;
};

export function PureUserAvatar({ username, name, sx, size, profilePictureUrl }: PureAvatarProps) {
    const initials = getUserInitials(name || username);

    return (
        <Avatar
            alt={username}
            {...(size ? { sx: { width: size, height: size, ...sx } } : { sx })}
            {...(profilePictureUrl && { src: profilePictureUrl })}
            imgProps={{ crossOrigin: 'anonymous' }}
        >
            <Typography {...(size && { sx: { fontSize: size / 2 } })}>{initials}</Typography>
        </Avatar>
    );
}

export default function UserAvatar({
    children,
    displayName = false,
    size,
    position,
    username,
    name,
    sx,
    className,
    profilePictureUrl,
}: UserAvatarProps): ReactElement {
    return (
        <Box
            {...(className && { className })}
            sx={{
                display: 'flex',
                flexDirection: position === 'right' ? 'row' : 'column',
                justifyContent: 'center',
                alignItems: 'center',
                ...sx,
            }}
        >
            <PureUserAvatar name={name} username={username} size={size} profilePictureUrl={profilePictureUrl} />
            {displayName && (
                <Typography sx={{ paddingLeft: position === 'right' ? 1 : 0 }} color="text" component="p">
                    {username}
                </Typography>
            )}
            {children}
        </Box>
    );
}
