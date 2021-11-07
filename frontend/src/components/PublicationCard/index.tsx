import { Box, Card, CardContent, Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import { Publication, User } from '../../lib/api/models';
import { Link } from 'react-router-dom';


interface Props {
    pub: Publication;
    user: User;
}

export default function PublicationCard({pub, user}: Props): ReactElement {
    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
                    <Box sx={{ width: '100%', paddingLeft: 1 }}>
                        <Link to={`/${user.username}/${pub.name}`}>
                            <Typography variant={'body1'}>
                                {pub.name};
                                {pub.introduction};
                            </Typography>
                        </Link>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
