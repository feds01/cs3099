import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React, { ReactElement } from 'react';

interface Props {
    id: string;
    mode?: 'pinned' | 'all';
}

export default function Publications({ id, mode = 'all' }: Props): ReactElement {
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
