import { Theme } from '@mui/material';
import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import React, { ReactElement } from 'react';

interface PublicationLinkProps {
    username: string;
    name: string;
    current: boolean;
    revision?: string;
    style?: React.CSSProperties;
}

const useStyles = makeStyles<Theme>((theme) => ({
    wrapper: {
        textDecoration: 'none',
        cursor: 'pointer',
        color: theme.palette.primary.main,

        '&:hover': {
            color: `${theme.palette.primary.main} !important`,
            textDecoration: 'underline'
        }
    },
}));

export default function PublicationLink({ username, name, current, revision, style }: PublicationLinkProps): ReactElement {
    const classes = useStyles();
    const basename = `/${username}/${name}` + (revision ? `/${revision}` : '');

    return (
        <Link className={classes.wrapper} style={style} to={basename}>
            {username}/{name}{!current && typeof revision !== 'undefined' && (`@${revision}`) }
        </Link>
    );
}
