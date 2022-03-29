import { Theme } from '@mui/material';
import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import React, { ReactElement } from 'react';
import { Publication } from '../../lib/api/models/publication';
import { constructBasePathFromPublication } from '../../lib/utils/publications';

type PublicationLinkProps = {
    style?: React.CSSProperties;
    publication: Publication;
};

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

export default function PublicationLink({ publication, style }: PublicationLinkProps): ReactElement {
    const classes = useStyles();
    const basename = constructBasePathFromPublication(publication);
    const { owner, revision, name, current } = publication;

    return (
        <Link className={classes.wrapper} style={style} to={basename}>
            {owner.username}/{name}
            {!current && `@${revision}`}
        </Link>
    );
}
