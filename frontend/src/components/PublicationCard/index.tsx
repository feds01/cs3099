import { Link } from 'react-router-dom';
import React, { ReactElement } from 'react';
import { Publication, User } from '../../lib/api/models';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';


interface Props {
    pub: Publication;
    user: User;
}

export default function PublicationCard({pub, user}: Props): ReactElement {
        return (
            <Card>
                <CardContent sx={{p: "0.4rem", "backgroundColor": "#f5fafc"}}>
                    <Box sx={{ display: 'flex', flexDirection: 'row'}}>
                        <Box sx={{ width: '100%', paddingLeft: 0.5}}>
                            <Link to={`/${user.username}/${pub.name}`} >
                                <Typography sx={{fontSize: "0.75rem", fontStyle: "bold", display:"inline-block"}}>
                                {pub.draft && <Chip sx={{fontSize:"0.75rem", fontVariant:"small-caps", height: "1rem", marginRight: "0.3rem"}} label="draft" color="primary" size="small"/>} <b>{pub.name}</b>
                                </Typography>
                            </Link>
                            <Typography sx={{fontSize: "0.6rem", margin: "0.5rem"}}>
                                {pub.introduction}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    
}
