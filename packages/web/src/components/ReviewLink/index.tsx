import React from 'react';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';

type ReviewLinkProps = {
    style?: React.CSSProperties;
    id: string;
    onClick?: () => void;
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

export default function ReviewLink({ id, style, onClick }: ReviewLinkProps) {
    const classes = useStyles();
    return (
        <Link className={classes.wrapper} style={style} onClick={onClick} to={`/review/${id}`}>
            review
        </Link>
    );
}
