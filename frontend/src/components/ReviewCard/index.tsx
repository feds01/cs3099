import Card from '@mui/material/Card';
import { Review } from '../../lib/api/models';

import UserLink from '../UserLink';
import { ReactElement } from 'react';
import { formatDistance } from 'date-fns';
import { useAuth } from '../../hooks/auth';
import { Box, CardContent, Typography, Chip, Button } from '@mui/material';
import PublicationLink from '../PublicationLink';

interface Props {
    review: Review;
}

export default function ReviewCard({ review }: Props): ReactElement {
    const { session } = useAuth();

    const { name, revision } = review.publication;
    const { username } = review.publication.owner;
    const isOwner = session.username === review.publication.owner.username;
    const isComplete = review.status === 'completed';

    return (
        <Card>
            <CardContent sx={{ p: '0.4rem', backgroundColor: '#f5fafc' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                        {!isComplete && (
                            <Chip
                                sx={{
                                    fontWeight: 'bold',
                                    mr: 1,
                                }}
                                label="draft"
                                color="primary"
                                size="small"
                            />
                        )}
                        <Typography>
                            <UserLink username={review.owner.username} />
                            {isComplete ? (
                                <>
                                    {' '}
                                    reviewed <PublicationLink
                                        username={username}
                                        name={name}
                                        revision={revision}
                                    />{' '}
                                    publication{' '}
                                </>
                            ) : (
                                <>
                                    {' '}
                                    began reviewing{' '}
                                    <PublicationLink
                                        username={username}
                                        name={name}
                                        revision={revision}
                                    /> publication{' '}
                                </>
                            )}
                            {formatDistance(review.updatedAt, new Date(), { addSuffix: true })}.
                        </Typography>
                    </Box>
                    <Button href={`/review/${review.id}`}>{isComplete ? 'Open' : isOwner ? 'Continue' : 'Open'}</Button>
                </Box>
            </CardContent>
        </Card>
    );
}
