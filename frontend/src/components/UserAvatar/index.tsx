import React, { ReactElement } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { User } from '../../lib/api/models';

type NameDisplayProps = { displayName?: false; position?: never } | { displayName: true; position: 'right' | 'bottom' };

interface CommonProps {
    children?: React.ReactNode;
    size?: number;
}

type Props = User & CommonProps & NameDisplayProps;

/**
 * Function that generates initials from provided first and last names of
 * a user.
 *
 * @param firstName The first name of the user.
 * @param lastName The last name of the user.
 * @returns The initials, based on the first and last name provided.
 */
export function getUserInitials(firstName?: string, lastName?: string): string {
    let initials = '';

    if (firstName) {
        initials += firstName.substring(0, 1).toUpperCase();
    }

    if (lastName) {
        initials += lastName.substring(0, 1).toUpperCase();
    }

    return initials;
}

export default function UserAvatar({
    children,
    firstName,
    displayName = false,
    size,
    position,
    lastName,
    username,
    profilePictureUrl,
}: Props): ReactElement {
    const initials = getUserInitials(firstName, lastName);

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
