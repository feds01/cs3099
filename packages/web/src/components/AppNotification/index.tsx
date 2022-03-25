import { nanoid } from 'nanoid';
import React, { useState, ReactElement } from 'react';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
    useNotificationState,
    AppNotification,
    useNotificationDispatch,
    NotificationSeverity,
} from '../../contexts/notification';
import { MdWarning, MdError, MdCheckCircle, MdClose } from 'react-icons/md';

/** Simple component to derive the right icon based on notification severity */
function NotificationIcon({ type }: { type: NotificationSeverity }): ReactElement {
    switch (type) {
        case 'warn':
            return <MdWarning size={20} color="warning" />;
        case 'success':
            return <MdCheckCircle size={20} color="success" />;
        case 'error':
            return <MdError size={20} color="error" />;
    }
}

/** Renderer for App notifications */
function AppNotificationContainer({ message, severity }: AppNotification) {
    const [open, setOpen] = useState(true);
    const notificationDispatcher = useNotificationDispatch();

    const handleClose = () => {
        notificationDispatcher({ type: 'remove' });
        setOpen(false);
    };

    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            message={
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <NotificationIcon type={severity} />
                    <Typography sx={{ pl: 1 }}>{message}</Typography>
                </Box>
            }
            action={
                <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
                    <MdClose fontSize="small" />
                </IconButton>
            }
        />
    );
}

/**
 * This is a container to display notification toasts when they are passed
 * via the notification context API. The component uses the 'useNotificationState'
 * to access the notification state.
 * */
export function NotificationDisplay({ children }: { children: React.ReactNode }) {
    const { appNotifications } = useNotificationState();

    // @@Hack: Use nanoid() here so we avoid react 'key' issues due to the fact that
    //         there are no unique identifiers for notifications and therefore we have
    //         to artificially create them.
    return (
        <>
            {children}
            {appNotifications.map((notification) => {
                return <AppNotificationContainer {...notification} key={nanoid()} />;
            })}
        </>
    );
}

export default NotificationDisplay;
