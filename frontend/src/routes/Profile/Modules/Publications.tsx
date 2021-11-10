import { Box, Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useEffect, useState } from 'react';
import PublicationCard from '../../../components/PublicationCard';
import { Publication, User } from '../../../lib/api/models';
import {useGetPublicationUsername} from '../../../lib/api/publications/publications';
import { ContentState } from '../../../types/requests';

interface Props {
    user: User;
    mode?: 'pinned' | 'all';
}

export default function Publications({ user, mode = 'all' }: Props): ReactElement {

    const pubQuery = useGetPublicationUsername(user.username, {
        ...(mode === "pinned" && { pinned: "true" }),
    });
    
    const [publications, setPublications] = useState<ContentState<Publication[], any>>({ state: 'loading' });

    useEffect(() => {
        if (pubQuery.isError) {
            setPublications({ state: 'error', error: pubQuery.error });
        } else if (pubQuery.data && !pubQuery.isLoading) {
            setPublications({ state: 'ok', data: pubQuery.data.data});
        }
    }, [pubQuery.data]);

    switch (publications.state){
        case 'loading':
            return <>Loading...</>;
        case 'error':
            return <>Something went wrong :(</>;
        case 'ok':
            return (
                <div>
                    <Typography variant="h4">Publications</Typography>
                    <Divider />
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: 'column'
                        }}>
                    <Typography variant="body1">{user.username}'s Publications</Typography>
                    <Grid container spacing={1} columns={{ xs: 1, sm: 1, md: 1 }} sx={{marginTop:"0.25rem"}}>
                        {publications.data.map((pub) => {
                            return (
                                <Grid key={pub.name} item xs={2} sm={3} md={3}>
                                    <PublicationCard key={pub.name} user={user} pub={pub} />
                                </Grid>
                            );
                        })}
                    </Grid>
                   </Box>
                </div>
            ); 

    }
   
}
