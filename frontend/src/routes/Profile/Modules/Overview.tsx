import Grid from '@mui/material/Grid';
import Activity from './Activity';
import React, { ReactElement } from 'react';
import Publications from './Publications';
import { User } from '../../../lib/api/models';

interface Props {
    id: string;
    user: User;
}

export default function Overview({ id, user}: Props): ReactElement {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
                <Activity id={id} withDivider title={'Activity'} limit={10} />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
                <Publications user={user} mode={'pinned'} />
            </Grid>
        </Grid>
    );
}
