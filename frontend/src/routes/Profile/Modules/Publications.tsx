import React, { ReactElement } from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useGetPublicationUsername } from '../../../lib/api/publications/publications';

interface Props {
    id: string;
    mode?: 'pinned' | 'all';
}

export default function Publications({ id, mode = 'all' }: Props): ReactElement {
    const pubQuery = useGetPublicationUsername(id, {
        ...(mode === 'pinned' && { pinned: 'true' }),
    });

    return (
        <div>
            <Typography variant="h4">Publications</Typography>
            <Divider />
            <p>
                {id} - {mode}
            </p>
        </div>
    );
}
