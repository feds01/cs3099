import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useState } from 'react';
import ActivityCard from '../../../components/ActivityCard';
import { range } from '../../../lib/utils/arrays';
import { ContentState } from '../../../types/requests';

interface Props {
    id: string;
    limit?: number;
    withDivider?: boolean;
    title: string;
}

// TODO: This is a temporary filler type
type UserActivity = {
    title: string;
};

export default function Activity({ title, withDivider = false, id, limit = 20 }: Props): ReactElement {
    const [activities] = useState<ContentState<UserActivity[], Error>>({ state: 'loading' });

    switch (activities.state) {
        case 'loading':
            return (
                <div>
                    <Typography variant="h4">{title}</Typography>
                    {withDivider && <Divider />}
                    <Box sx={{ display: 'flex', paddingTop: 1, flexDirection: 'column' }}>
                        {range(10).map((idx) => {
                            return <ActivityCard key={idx} />;
                        })}
                    </Box>
                </div>
            );
        case 'error':
            return <>Something went wrong :(</>;
        case 'ok':
            return (
                <div>
                    <Typography variant="h4">Activity</Typography>
                    <Divider />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {activities.data.map((activity) => {
                            return <p>{activity.title}</p>;
                        })}
                    </Box>
                </div>
            );
    }
}
