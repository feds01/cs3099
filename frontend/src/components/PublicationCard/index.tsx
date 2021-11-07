import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import { Publication, User } from '../../lib/api/models';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import PublishedWithChanges from '@mui/icons-material/PublishedWithChanges';


interface Props {
    pub: Publication;
    user: User;
}

export default function PublicationCard({pub, user}: Props): ReactElement {
    if(pub.draft){
        return (
            <Card>
                <CardContent sx={{p: "0.4rem", "backgroundColor": "#f5fafc"}}>
                    <Box sx={{ display: 'flex', flexDirection: 'row'}}>
                        <Box sx={{ width: '100%', paddingLeft: 0.5}}>
                            <Link to={`/${user.username}/${pub.name}`} >
                                <Typography sx={{fontSize: "0.75rem", fontStyle: "bold", display:"inline-block"}}>
                                <Chip sx={{fontSize:"0.75rem", fontVariant:"small-caps", height: "1rem", marginRight: "0.3rem"}} label="draft" color="primary" size="small"/><b>{pub.name}</b>
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
    } else {
        return (
            <Card>
                <CardContent sx={{p: "0.4rem"}}>
                    <Box sx={{ display: 'flex', flexDirection: 'row'}}>
                        <Box sx={{ width: '100%', paddingLeft: 0.5}}>
                            <Link to={`/${user.username}/${pub.name}`} >
    
                                <Typography sx={{fontSize: "0.75rem", fontStyle: "bold", display:"inline-block"}}>
                                    <b>{pub.name}</b>
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
    
}
