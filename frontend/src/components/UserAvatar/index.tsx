import React, { ReactElement } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

interface Props {
    firstName?: string;
    lastName?: string;
    username: string;
    profilePictureUrl?: string;
    displayName: boolean;
    position: 'right' | 'bottom';
}

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

// TODO: support different sizes too
export default function UserAvatar({
    firstName,
    displayName,
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
            <Avatar alt={username} {...(profilePictureUrl && { src: profilePictureUrl })}>
                {initials}
            </Avatar>
            {displayName && (
                <Typography sx={{ paddingLeft: 1 }} color="text" component="p">
                    {username}
                </Typography>
            )}
        </Box>
    );
}
