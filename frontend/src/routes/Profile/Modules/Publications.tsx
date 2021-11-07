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

    const pubQuery = useGetPublicationUsername(user.username);
    
    const [pubs, setPubs] = useState<ContentState<Publication[], any>>({ state: 'loading' });

    useEffect(() => {
        if (pubQuery.isError) {
            console.log("error");
            setPubs({ state: 'error', error: pubQuery.error });
        } else if (pubQuery.data) {
            console.log("ok");
            setPubs({ state: 'ok', data: pubQuery.data.data});
        }
    }, [pubQuery.data]);

    switch (pubs.state){
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
                            backgroundColor: '#E5E5E5', 
                            width:'40%',
                            minWidth: '500px',
                            height: "400px",
                            marginLeft: "30%",
                            marginTop: "2rem",
                            borderRadius: "1rem"
                            }}>
                    <Grid container spacing={1} columns={{ xs: 4, sm: 9, md: 12 }}>
                    {pubs.data.map((pub) => {
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
