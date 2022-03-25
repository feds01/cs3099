import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatDistance } from 'date-fns';
import { alpha } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import { useNotificationDispatch } from '../contexts/notification';
import { Notification } from '../lib/api/models';
import { usePostNotificationsIdView } from '../lib/api/notifications/notifications';
import ReviewLink from '../components/ReviewLink';
import { MdDone } from 'react-icons/md';
import { PureUserAvatar } from '../components/UserAvatar';
import PublicationTextWidget from '../components/PublicationTextWidget';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

type NotificationRowProps = {
    notification: Notification;
    isSelected: boolean;
    handleClick: (event: React.MouseEvent<unknown>, id: string) => void;
};

function NotificationTableRow({ notification, handleClick, isSelected }: NotificationRowProps) {
    const [showDone, setShowDone] = useState(false);

    const notificationViewQuery = usePostNotificationsIdView();
    const notificationDispatcher = useNotificationDispatch();

    // We send a request to the server to mark the notification as seen and then
    // in the UI to also filter out the notification so it doesn't persist until
    // the next fetch
    const markNotificationAsViewed = async () => {
        await notificationViewQuery.mutateAsync({ id: notification.id });
        notificationDispatcher({ type: 'visitNotification', id: notification.id });
    };

    return (
        <TableRow
            hover
            onClick={(event) => handleClick(event, notification.id)}
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={-1}
            selected={isSelected}
        >
            <TableCell padding="checkbox">
                <Checkbox color="primary" checked={isSelected} />
            </TableCell>
            <TableCell padding="checkbox">
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <PublicationTextWidget publication={notification.review.publication} />
                    <Typography variant="body1">
                        You were tagged in a{' '}
                        <ReviewLink id={notification.review.id} onClick={markNotificationAsViewed} />{' '}
                    </Typography>
                </Box>
            </TableCell>
            <TableCell>
                <PureUserAvatar size={24} {...notification.author} />
            </TableCell>
            <TableCell
                align={showDone ? 'center' : 'left'}
                onMouseEnter={() => setShowDone(true)}
                onMouseLeave={() => setShowDone(false)}
            >
                {showDone ? (
                    <IconButton size="small" onClick={markNotificationAsViewed}>
                        <MdDone />
                    </IconButton>
                ) : (
                    <Typography>{formatDistance(notification.updatedAt, new Date(), { addSuffix: true })}</Typography>
                )}
            </TableCell>
        </TableRow>
    );
}

interface HeadCell {
    disablePadding: boolean;
    id: 'user' | 'notification' | 'time';
    width: string;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'notification',
        width: '70%',
        disablePadding: true,
    },
    {
        id: 'user',
        width: '5%',
        disablePadding: true,
    },
    {
        id: 'time',
        width: '25%',
        disablePadding: true,
    },
];

interface EnhancedTableProps {
    numSelected: number;
    rowCount: number;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function EnhancedTableHead({ onSelectAllClick, numSelected, rowCount }: EnhancedTableProps) {
    const notificationDispatcher = useNotificationDispatch();

    /** Function to send requests to mark notifications as being viewed */
    const markAsDone = async () => {
        notificationDispatcher({ type: 'setUserNotifications', notifications: [] });
    };

    return (
        <TableHead>
            <TableRow
                sx={{
                    ...(numSelected > 0 && {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                    }),
                }}
            >
                <TableCell padding="checkbox">
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Checkbox
                            color="primary"
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                        />
                    </Box>
                </TableCell>
                {headCells.map((headCell, index) => (
                    <TableCell
                        key={headCell.id}
                        align={'left'}
                        width={headCell.width}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                    >
                        {index === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 'bold' }}>Select all</Typography>
                                {numSelected > 0 && (
                                    <Box sx={{ pl: 2, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Button size="small" onClick={markAsDone} startIcon={<MdDone />}>
                                            Done
                                        </Button>
                                        <Typography
                                            sx={{ pl: 1, fontWeight: 'bold' }}
                                            color="inherit"
                                            variant="subtitle1"
                                        >
                                            {numSelected} selected
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface NotificationFeedProps {
    notifications: Notification[];
}

export default function NotificationFeed({ notifications }: NotificationFeedProps) {
    const [selected, setSelected] = useState<readonly string[]>([]);

    /** Handle the 'select all' checkbox event */
    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const selectedItems = notifications.map((n) => n.id);
            setSelected(selectedItems);
            return;
        }

        setSelected([]);
    };

    /**
     * Function to essentially reduce a click to what it should do with the row.
     * If the item is already selected, unselect it, if it isn't select it and
     * some other edge cases.
     *
     * @param event - The click event
     * @param id - Notification ID
     */
    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }

        setSelected(newSelected);
    };

    /** Function to check if an item is selected  */
    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    return (
        <Box sx={{ width: '100%', mt: `8px !important` }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
                        <EnhancedTableHead
                            numSelected={selected.length}
                            onSelectAllClick={handleSelectAllClick}
                            rowCount={notifications.length}
                        />
                        <TableBody>
                            {notifications.map((notification) => {
                                const isItemSelected = isSelected(notification.id);

                                return (
                                    <NotificationTableRow
                                        notification={notification}
                                        handleClick={handleClick}
                                        key={notification.id}
                                        isSelected={isItemSelected}
                                    />
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
