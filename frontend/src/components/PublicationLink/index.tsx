import { Theme } from '@mui/material';
import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import React, { ReactElement } from 'react';

interface Props {
    username: string;
    name: string;
    current: boolean;
    revision?: string;
}

const useStyles = makeStyles<Theme>((theme) => ({
    wrapper: {
        textDecoration: 'none',
        cursor: 'pointer',
        color: theme.palette.primary.main
    },
}));

export default function PublicationLink({ username, name, current, revision }: Props): ReactElement {
    const classes = useStyles();
    const basename = `/${username}/${name}` + (revision ? `/${revision}` : '');

    return (
        <Link className={classes.wrapper} to={basename}>
            {username}/{name}{!current && typeof revision !== 'undefined' && (`@${revision}`) }
        </Link>
    );
}
