import { range } from '../../lib/utils/arrays';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { ReactElement } from 'react';

interface SkeletonListProps {
    rows: number;
}

export default function SkeletonList({ rows }: SkeletonListProps): ReactElement {
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
