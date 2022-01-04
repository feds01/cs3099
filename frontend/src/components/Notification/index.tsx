import React, { useState, ReactElement } from 'react';
import Close from '@mui/icons-material/Close';
import Box from '@mui/material/Box/Box';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/ReportRounded';
import SuccessIcon from '@mui/icons-material/CheckCircle';
import {
  useNotificationState,
  Notification,
  useNotificationDispatch,
  NotificationSeverity,
} from '../../hooks/notification';

function NotificationIcon({ type }: { type: NotificationSeverity }): ReactElement {
  switch (type) {
    case "warn":
      return <WarningIcon />;
    case "success":
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
  }
}

type NotificationContainerProps = Notification;

function NotificationContainer({ message, severity }: NotificationContainerProps) {
  const [open, setOpen] = useState(true);
  const notificationDispatcher = useNotificationDispatch();

  const handleClose = () => {
    notificationDispatcher({ type: "remove" });
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
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        }}>
          <NotificationIcon type={severity} />
          <Typography>{message}</Typography>
        </Box>
      }
      action={
        <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
          <Close fontSize="small" />
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
  const notifications = useNotificationState();

  return (
    <>
      {children}
      {notifications.map((notification, index) => {
        return <NotificationContainer {...notification} key={index} />;
      })}
    </>
  );
}

export default NotificationDisplay;
