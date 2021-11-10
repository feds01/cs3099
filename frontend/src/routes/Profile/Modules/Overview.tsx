import Grid from '@mui/material/Grid';
import Activity from './Activity';
import React, { ReactElement } from 'react';
import Publications from './Publications';
import { User } from '../../../lib/api/models';

interface Props {
    user: User;
}

export default function Overview({ user}: Props): ReactElement {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
                <Activity username={user.username} title={'Activity'} limit={10} />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
                <Publications user={user} limit={6} mode={'pinned'} />
            </Grid>
        </Grid>
    );
}
