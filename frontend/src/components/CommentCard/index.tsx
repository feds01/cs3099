import { formatDistance } from 'date-fns';
import React, { ReactElement, useEffect, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Card, CardContent, Typography, CardHeader, IconButton, Menu, MenuItem, Divider, Box } from '@mui/material';

import UserLink from '../UserLink';
import UserAvatar from '../UserAvatar';
import CommentEditor from '../CommentEditor';
import MarkdownRenderer from '../MarkdownRenderer';
import { Comment, Review } from '../../lib/api/models';
import { useDeleteCommentId } from '../../lib/api/comments/comments';
import { useNotificationDispatch } from '../../hooks/notification';
import { useReviewDispatch } from '../../hooks/review';

interface CommentCardProps {
    comment: Comment;
    review: Review;
}

export default function CommentCard({ comment, review }: CommentCardProps): ReactElement {
    const { refetch } = useReviewDispatch();
    const notificationDispatcher = useNotificationDispatch();

    // Comment card editing menu
    const [editingComment, setEditingComment] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);

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

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEditComment = () => {
        setEditingComment(true);
        handleClose();
    };

    const handleDeleteComment = () => {
        deleteComment.mutateAsync({id: comment.id});
        handleClose();
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
                                <span style={{
                                    display: "inline-block",
                                    padding: "2px 4px",
                                }}>&bull;</span>
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
                    <IconButton aria-label="settings" onClick={handleClick} aria-expanded={isOpen ? 'true' : undefined}>
                        <MoreVertIcon />
                    </IconButton>
                }
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                {editingComment ? (
                    <CommentEditor
                        isModifying
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
                open={isOpen}
                onClose={handleClose}
            >
                <MenuItem
                    disabled={editingComment || deleteComment.isLoading}
                    onClick={handleEditComment}
                    disableRipple
                >
                    Edit comment
                </MenuItem>
                <Divider />
                <MenuItem disabled={deleteComment.isLoading} onClick={handleDeleteComment} disableRipple>
                    <Typography sx={{ fontWeight: 'bold', color: (t) => t.palette.error.main }}>
                        Delete comment
                    </Typography>
                </MenuItem>
            </Menu>
        </Card>
    );
}
