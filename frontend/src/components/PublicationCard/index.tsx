import { Link } from 'react-router-dom';
import React, { ReactElement } from 'react';
import { Publication, User } from '../../lib/api/models';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import MarkdownRenderer from '../MarkdownRenderer';

interface Props {
    pub: Publication;
    user: User;
}

export default function PublicationCard({ pub, user }: Props): ReactElement {
    return (
        <Card>
            <Link to={`/${user.username}/${pub.name}`}>
                <CardContent sx={{ p: '0.4rem', backgroundColor: '#f5fafc' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '100%', paddingLeft: 0.5 }}>
                            <Typography variant={'h5'} sx={{ fontStyle: 'bold', display: 'inline-block' }}>
                                {pub.draft && (
                                    <Chip
                                        sx={{
                                            fontVariant: 'small-caps',
                                            height: '1rem',
                                            fontWeight: 'bold',
                                            marginRight: '0.3rem',
                                        }}
                                        label="draft"
                                        color="primary"
                                        size="small"
                                    />
                                )}{' '}
                                <b>{pub.name}</b>
                            </Typography>
                            <MarkdownRenderer contents={pub.introduction ?? ''} />
                        </Box>
                    </Box>
                </CardContent>
            </Link>
        </Card>
    );
}
