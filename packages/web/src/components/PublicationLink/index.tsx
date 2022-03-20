import { Theme } from '@mui/material';
import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import React, { ReactElement } from 'react';
import { Publication } from '../../lib/api/models/publication';

type PublicationLinkProps = {
    style?: React.CSSProperties;
} & Publication;

const useStyles = makeStyles<Theme>((theme) => ({
    wrapper: {
        textDecoration: 'none',
        cursor: 'pointer',
        color: theme.palette.primary.main,

        '&:hover': {
            color: `${theme.palette.primary.main} !important`,
            textDecoration: 'underline',
        },
    },
}));

export default function PublicationLink({ owner, name, current, revision, style }: PublicationLinkProps): ReactElement {
    const classes = useStyles();
    const basename = `/${owner.username}/${name}` + (revision ? `/${revision}` : '');

    return (
        <Link className={classes.wrapper} style={style} to={basename}>
            {owner.username}/{name}
            {!current && typeof revision !== 'undefined' && `@${revision}`}
        </Link>
    );
}
