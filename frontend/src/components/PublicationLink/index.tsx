import { Theme } from '@mui/material';
import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import React, { ReactElement } from 'react';

interface Props {
    username: string;
    name: string;
    revision?: string;
}

const useStyles = makeStyles<Theme>((theme) => ({
    wrapper: {
        textDecoration: 'none',
        cursor: 'pointer',
        color: theme.palette.primary.main
    },
}));

export default function PublicationLink({ username, name, revision }: Props): ReactElement {
    const classes = useStyles();
    const basename = `/${username}/${name}` + (revision ? `/${revision}` : '');

    return (
        <Link className={classes.wrapper} to={basename}>
            {username}/{name}
        </Link>
    );
}
