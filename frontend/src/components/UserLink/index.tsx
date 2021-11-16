import Link from '@mui/material/Link';
import { ReactElement } from 'react';
import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

interface Props {
    username: string;
}

const useStyles = makeStyles<Theme>(() => ({
    wrapper: {
        textDecoration: "none",
        cursor: "pointer"
    },
}));

export default function UserLink({ username }: Props): ReactElement {
    const classes = useStyles();

    return <Link className={classes.wrapper} href={`/profile/${username}`}>@{username}</Link>;
}
