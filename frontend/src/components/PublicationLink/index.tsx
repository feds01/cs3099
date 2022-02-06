import Link from '@mui/material/Link';
import React, { ReactElement } from 'react';
import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

interface Props {
    username: string;
    name: string;
    revision?: string;
}

const useStyles = makeStyles<Theme>(() => ({
    wrapper: {
        textDecoration: 'none',
        cursor: 'pointer',
    },
}));

export default function PublicationLink({ username, name, revision }: Props): ReactElement {
    const classes = useStyles();
    const basename = `/${username}/${name}` + (revision ? `/${revision}` : '');

    return (
        <Link className={classes.wrapper} href={basename}>
            {username}/{name}
        </Link>
    );
}
