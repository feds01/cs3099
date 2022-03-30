import { SxProps, Theme, useTheme } from '@mui/material';
import Chip from '@mui/material/Chip';
import { ExtendedRole } from '../../lib/utils/roles';

/**
 * Function to shorten role names to be more ergonomic when displaying
 *
 * @param role - The role that is to be shortened
 * @returns - A shortened role name
 */
function getShortenedRole(role: ExtendedRole): string {
    switch (role) {
        case 'administrator':
            return 'admin';
        case 'moderator':
            return 'mod';
        default:
            return role;
    }
}

/**
 * Function to deduce the colour of the chip based on the role
 *
 * @param role - The role to convert into a colour
 */
function getRoleColour(role: ExtendedRole, theme: Theme): string | undefined {
    switch (role) {
        case 'moderator':
        case 'administrator':
            return theme.palette.primary.main;
        case 'collaborator':
        case 'owner':
            return theme.palette.secondary.main;
        case 'reviewer':
            return '#581845';
        default:
            return undefined;
    }
}

type RoleChipProps = {
    role: ExtendedRole;
    sx?: SxProps<Theme>;
};

export default function RoleChip({ role, sx }: RoleChipProps) {
    const theme = useTheme();

    // We don't need to consider default roles...
    if (role === 'default') {
        return null;
    }

    return (
        <Chip
            size="small"
            color={'primary'}
            sx={{ fontWeight: 'bold', ...sx, backgroundColor: getRoleColour(role, theme) }}
            label={getShortenedRole(role)}
        />
    );
}
