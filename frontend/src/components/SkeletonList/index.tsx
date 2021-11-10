import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { range } from '../../lib/utils/arrays';
import React, { ReactElement } from 'react';

interface Props {
    rows: number;
    // children: React.ReactNode; @@TODO: use this as the list bit
}

export default function SkeletonList({ rows }: Props): ReactElement {
    return (
        <Box sx={{ display: 'flex', paddingTop: 1, flexDirection: 'column' }}>
            {range(rows).map((idx) => {
                return (
                    <Box key={idx} sx={{ width: '100%' }}>
                        <Typography variant={'body1'}>
                            <Skeleton />
                        </Typography>
                        <Typography variant={'caption'}>
                            <Skeleton />
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}
