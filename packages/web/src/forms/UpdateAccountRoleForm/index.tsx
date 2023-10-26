import { useAuth } from '../../contexts/auth';
import { useNotificationDispatch } from '../../contexts/notification';
import { User, UserRole } from '../../lib/api/models';
import { usePatchUserUsernameRole } from '../../lib/api/users/users';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useEffect } from 'react';
import { computeUserPermission } from '../../lib/utils/roles';

type UpdateAccountRoleFormProps = {
    user: User;
    refetch: () => void;
};

export default function UpdateAccountRoleForm({ user, refetch }: UpdateAccountRoleFormProps) {
    const { session } = useAuth();

    const updateUserRoleQuery = usePatchUserUsernameRole();
    const notificationDispatcher = useNotificationDispatch();

    useEffect(() => {
        if (updateUserRoleQuery.isError) {
            notificationDispatcher({ type: 'add', item: { severity: 'error', message: 'Failed to update user role' } });
        } else if (updateUserRoleQuery.data) {
            notificationDispatcher({ type: 'add', item: { severity: 'success', message: 'Updated user role' } });
            refetch();
        }
    }, [updateUserRoleQuery.data, updateUserRoleQuery.error]);

    const handleChange = async (event: SelectChangeEvent<UserRole>) => {
        await updateUserRoleQuery.mutateAsync({
            username: user.username,
            data: { role: event.target.value as UserRole },
        });
    };

    return (
        <Select
            size="small"
            value={user.role}
            disabled={!computeUserPermission(user.id, session)}
            onChange={handleChange}
        >
            <MenuItem value="default">Default</MenuItem>
            {session.role !== 'default' && <MenuItem value="moderator">Moderator</MenuItem>}
            {session.role === 'administrator' && <MenuItem value="administrator">Administrator</MenuItem>}
        </Select>
    );
}
