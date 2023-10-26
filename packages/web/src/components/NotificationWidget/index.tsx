import { Badge, IconButton, Tooltip } from '@mui/material';
import { MdOutlineNotifications } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useNotificationState } from '../../contexts/notification';

/** Component for rendering any notifications that the user has received */
export default function NotificationWidget() {
    const { userNotifications } = useNotificationState();

    return (
        <Link to="/notifications">
            <Tooltip title={'Notifications'}>
                <IconButton
                    sx={{
                        width: '28px',
                        height: '28px',
                        border: '1px solid #E0E3E7',
                        borderRadius: '10px',
                        mr: 1,
                    }}
                >
                    <Badge color="error" variant="dot" badgeContent={userNotifications.length}>
                        <MdOutlineNotifications />
                    </Badge>
                </IconButton>
            </Tooltip>
        </Link>
    );
}
