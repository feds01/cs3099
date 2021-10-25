import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import React, { ReactElement } from 'react';

interface Props {}

// TODO: This is only a skeleton view of the ActivityCard
export default function ActivityCard(props: Props): ReactElement {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
            <Skeleton sx={{ marginRight: 1 }} animation="wave" variant="circular" width={40} height={40} />
            <Box sx={{ width: '100%' }}>
                <Typography variant={'body1'}>
                    <Skeleton />
                </Typography>
                <Typography variant={'caption'}>
                    <Skeleton />
                </Typography>
            </Box>
        </Box>
    );
}
