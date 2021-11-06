import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Publication, User } from '../../lib/api/models';

interface Props {
    user: User;
    pub: Publication;
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
