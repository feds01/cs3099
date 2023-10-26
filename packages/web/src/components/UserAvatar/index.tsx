import { User } from '../../lib/api/models';
import { getUserInitials } from '../../lib/utils/user';
import { SxProps, Theme, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

type NameDisplayProps =
    | { displayName?: false; position?: never; userLink?: never }
    | { displayName: true; userLink: boolean; position: 'right' | 'bottom' };

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

const useStyles = makeStyles<Theme>((theme) => ({
    hoverable: {
        textDecoration: 'none',
        cursor: 'pointer',
        '&:hover': {
            color: theme.palette.primary.main,
        },
    },
}));

export function PureUserAvatar({ username, name, sx, size, profilePictureUrl }: PureAvatarProps) {
    const initials = getUserInitials(name || username);

    return (
        <Link to={`/profile/${username}`}>
            <Avatar
                alt={username}
                {...(size ? { sx: { width: size, height: size, ...sx } } : { sx })}
                {...(profilePictureUrl && { src: profilePictureUrl })}
                imgProps={{ crossOrigin: 'anonymous' }}
            >
                <Typography {...(size && { sx: { fontSize: size / 2 } })}>{initials}</Typography>
            </Avatar>
        </Link>
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
    userLink,
    className,
    profilePictureUrl,
}: UserAvatarProps): ReactElement {
    const classes = useStyles();

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
            {displayName &&
                (userLink ? (
                    <Link className={classes.hoverable} to={`/profile/${username}`}>
                        <Typography
                            variant={'body1'}
                            sx={{
                                pl: 0.5,
                                fontWeight: 'bold',
                                color: 'dimgray',
                                '&:hover': { color: (t) => t.palette.primary.main },
                            }}
                        >
                            @{username}
                        </Typography>
                    </Link>
                ) : (
                    <Typography variant={'body1'} sx={{ pl: 0.5 }}>
                        {username}
                    </Typography>
                ))}
            {children}
        </Box>
    );
}
