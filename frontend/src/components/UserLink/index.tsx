import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';

interface Props {
    username: string;
}

const useStyles = makeStyles<Theme>((theme) => ({
    wrapper: {
        textDecoration: 'none',
        cursor: 'pointer',
        color: theme.palette.primary.main
    },
}));

export default function UserLink({ username }: Props): ReactElement {
    const classes = useStyles();

    return (
        <Link className={classes.wrapper} to={`/profile/${username}`}>
            @{username}
        </Link>
    );
}
