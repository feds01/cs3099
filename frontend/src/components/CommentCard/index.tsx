import { formatDistance } from 'date-fns';
import React, { ReactElement, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import UserLink from '../UserLink';
import UserAvatar from '../UserAvatar';
import { useAuth } from '../../hooks/auth';
import CommentEditor from '../CommentEditor';
import MarkdownRenderer from '../MarkdownRenderer';
import { useReviewDispatch } from '../../hooks/review';
import { Comment, Review } from '../../lib/api/models';
import { useNotificationDispatch } from '../../hooks/notification';
import { useDeleteCommentId } from '../../lib/api/comments/comments';

interface CommentCardProps {
    comment: Comment;
    review: Review;
}

export default function CommentCard({ comment, review }: CommentCardProps): ReactElement {
    const { session } = useAuth();
    const { refetch } = useReviewDispatch();
    const notificationDispatcher = useNotificationDispatch();

    // Comment card editing menu
    const [editingComment, setEditingComment] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // Comment reply mechanism
    const [replyingToComment, setReplyingToComment] = useState<boolean>(false);

    // Comment card deleting functionality
    const deleteComment = useDeleteCommentId();

    useEffect(() => {
        if (!deleteComment.isLoading && deleteComment.data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully deleted comment.' },
            });

            // Send a refetch signal to the review editor as we need to show that the comment is deleted.
            refetch();
        } else if (deleteComment.isError && deleteComment.error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't delete comment." },
            });
        }
    }, [deleteComment.isLoading, deleteComment.data]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    return (
        <Card variant={'outlined'} sx={{ width: '100%', p: 1 }}>
            <CardHeader
                avatar={<UserAvatar {...comment.author} displayName={false} size={40} />}
                title={
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography variant={'body1'}>
                            {comment.author.firstName} {comment.author.lastName}
                        </Typography>
                        {comment.edited && (
                            <>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        padding: '2px 4px',
                                    }}
                                >
                                    &bull;
                                </span>
                                <Typography variant={'body1'}>edited</Typography>
                            </>
                        )}
                    </Box>
                }
                subheader={
                    <Typography variant={'body2'}>
                        <UserLink username={comment.author.username} />{' '}
                        {formatDistance(comment.updatedAt, new Date(), { addSuffix: true })}
                    </Typography>
                }
                action={
                    <IconButton
                        aria-label="comment-settings"
                        onClick={handleClick}
                        aria-expanded={anchorEl ? 'true' : undefined}
                    >
                        <MoreVertIcon />
                    </IconButton>
                }
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                {editingComment ? (
                    <CommentEditor
                        type={'modify'}
                        filename={comment.filename}
                        contents={comment.contents}
                        // TODO: Support comment anchors!
                        location={comment.anchor?.start || 0}
                        reviewId={review.id}
                        commentId={comment.id}
                        onClose={() => setEditingComment(false)}
                    />
                ) : (
                    <MarkdownRenderer contents={comment.contents} />
                )}
            </CardContent>
            <Menu
                id="comment-settings"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    disabled={editingComment || deleteComment.isLoading}
                    onClick={() => {
                        setEditingComment(true);
                        setAnchorEl(null);
                    }}
                    disableRipple
                >
                    Edit comment
                </MenuItem>
                <Divider />
                <MenuItem
                    disabled={deleteComment.isLoading}
                    onClick={() => {
                        deleteComment.mutateAsync({ id: comment.id });
                        setAnchorEl(null);
                    }}
                    disableRipple
                >
                    <Typography sx={{ fontWeight: 'bold', color: (t) => t.palette.error.main }}>
                        Delete comment
                    </Typography>
                </MenuItem>
            </Menu>
            {replyingToComment ? (
                <CommentEditor
                    type={'reply'}
                    reviewId={review.id}
                    commentId={comment.id}
                    onClose={() => setReplyingToComment(false)}
                />
            ) : (
                <Box
                    sx={{
                        pt: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                    }}
                >
                    <UserAvatar {...session} />
                    <TextField
                        sx={{ ml: 0.5 }}
                        variant="outlined"
                        fullWidth
                        size="small"
                        placeholder="Reply..."
                        onClick={() => setReplyingToComment(true)}
                    />
                </Box>
            )}
        </Card>
    );
}
