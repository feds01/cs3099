import { ActivityReference } from '../../lib/api/models';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactElement } from 'react';

interface ActivityCardProps {
    message: string;
    references: ActivityReference[];
}

export default function ActivityCard({ message, references }: ActivityCardProps): ReactElement {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
            <Typography variant={'body1'}>{message}</Typography>
        </Box>
    );
}
