import Grid from '@mui/material/Grid';
import Activity from './Activity';
import React, { ReactElement } from 'react';
import Publications from './Publications';

interface Props {
    id: string;
}

export default function Overview({ id }: Props): ReactElement {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
                <Activity id={id} withDivider title={'Activity'} limit={10} />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
                <Publications id={id} mode={'pinned'} />
            </Grid>
        </Grid>
    );
}
