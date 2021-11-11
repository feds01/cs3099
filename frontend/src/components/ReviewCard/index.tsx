import Card from '@mui/material/Card';
import { Review } from '../../lib/api/models';

import { Link } from 'react-router-dom';
import React, { ReactElement } from 'react';
import { formatDistance } from 'date-fns';
import { Publication, User } from '../../lib/api/models';
import { Box, CardContent, Typography } from '@mui/material';

interface Props {
    review: Review;
}

export default function index({ review }: Props): ReactElement {
    return (
        <Card>
            <Link to={`/${review.owner.username}/${review.publication.name}/reviews/${review.id}`}>
                <CardContent sx={{ p: '0.4rem', backgroundColor: '#f5fafc' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '100%', paddingLeft: 0.5 }}>
                            <Typography>
                                <Link to={`/profile/${review.owner.username}`}>@{review.owner.username}</Link> reviewed
                                this submission {formatDistance(review.updatedAt, new Date(), { addSuffix: true })}.
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Link>
        </Card>
    );
}
