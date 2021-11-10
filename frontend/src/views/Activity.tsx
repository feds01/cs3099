import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ReactElement, useState } from 'react';
import Typography from '@mui/material/Typography';
import { ContentState } from '../types/requests';
import Stars from '../static/images/stars.svg';

interface Props {
    username: string;
    limit?: number;
    title: string;
}

// TODO: This is a temporary filler type
type UserActivity = {
    title: string;
};

export default function Activity({ title, username, limit = 20 }: Props): ReactElement {
    const [activities] = useState<ContentState<UserActivity[], Error>>({ state: 'loading' });

    switch (activities.state) {
        case 'loading':
            return (
                <div>
                    <Typography variant="h4">{title}</Typography>
                    <Divider />
                    <Box
                        sx={{
                            display: 'flex',
                            paddingTop: 1,
                            width: '100%',
                            alignItems: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <img src={Stars} height={96} width={96} alt="unavailable" />
                        <Typography variant="body2">Service is unavailable.</Typography>
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
