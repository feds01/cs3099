import { User } from '../../lib/api/models';
import Tooltip from '../Tooltip';
import UserAvatar from '../UserAvatar';
import { Box, Divider, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ReactElement, useState } from 'react';
import { Link } from 'react-router-dom';

interface Props {
    user: User;
    noPopover?: boolean;
}

const useStyles = makeStyles<Theme>((theme) => ({
    wrapper: {
        textDecoration: 'none',
        cursor: 'pointer',
        color: theme.palette.primary.main,
    },
    hoverable: {
        textDecoration: 'none',
        cursor: 'pointer',
        '&:hover': {
            color: theme.palette.primary.main,
        },
    },
}));

export default function UserLink({ user, noPopover = false }: Props): ReactElement {
    const classes = useStyles();

    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <Tooltip
            open={open}
            onClose={handleClose}
            placement="bottom-start"
            onOpen={handleOpen}
            title={
                <>
                    {user.status && (
                        <Box>
                            <Typography variant={'body2'}>{user.status}</Typography>
                        </Box>
                    )}
                    <Divider />
                    <Box sx={{ display: 'flex', flexDirection: 'row', p: '4px 12px', pb: 1 }}>
                        <UserAvatar {...user} displayName={false} size={40} />
                        <Box
                            sx={{
                                width: '100%',
                                pl: 1,
                                pt: 1,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Link className={classes.hoverable} to={`/profile/${user.username}`}>
                                    <Typography sx={{ pr: 1, fontWeight: 'bold' }} variant={'body1'}>
                                        {user.name}
                                    </Typography>
                                </Link>
                                <Link className={classes.hoverable} to={`/profile/${user.username}`}>
                                    <Typography
                                        variant={'body2'}
                                        sx={{ color: 'dimgray', '&:hover': { color: (t) => t.palette.primary.main } }}
                                    >
                                        @{user.username}
                                    </Typography>
                                </Link>
                            </Box>
                            <Typography>{user.about}</Typography>
                        </Box>
                    </Box>
                </>
            }
        >
            <Link className={classes.wrapper} to={`/profile/${user.username}`}>
                @{user.username}
            </Link>
        </Tooltip>
    );
}
