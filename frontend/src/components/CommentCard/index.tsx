import React, { ReactElement } from 'react';
import UserLink from '../UserLink';
import UserAvatar from '../UserAvatar';
import { formatDistance } from 'date-fns';
import { Comment } from '../../lib/api/models';
import MarkdownRenderer from '../MarkdownRenderer';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Card, CardContent, Typography, CardHeader, IconButton } from '@mui/material';

interface Props {
    comment: Comment;
}

export default function CommentCard({ comment }: Props): ReactElement {
    return (
        <Card variant={'outlined'} sx={{width: '100%', p: 1}}>
            <CardHeader
                avatar={<UserAvatar {...comment.author} displayName={false} size={40} />}
                title={
                    <Typography variant={'body1'}>
                        {comment.author.firstName} {comment.author.lastName}
                    </Typography>
                }
                subheader={
                    <Typography variant={'body2'}>
                        <UserLink username={comment.author.username} /> on{' '}
                        {formatDistance(comment.updatedAt, new Date(), { addSuffix: true })}
                    </Typography>
                }
                action={
                    <IconButton aria-label="settings">
                        <MoreVertIcon />
                    </IconButton>
                }
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                <MarkdownRenderer contents={comment.contents} />
            </CardContent>
        </Card>
    );
}
