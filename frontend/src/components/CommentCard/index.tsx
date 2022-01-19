import { formatDistance } from 'date-fns';
import React, { ReactElement, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Card, CardContent, Typography, CardHeader, IconButton, Menu, MenuItem, Divider, Box } from '@mui/material';

import UserLink from '../UserLink';
import UserAvatar from '../UserAvatar';
import CommentEditor from '../CommentEditor';
import MarkdownRenderer from '../MarkdownRenderer';
import { Comment, Review } from '../../lib/api/models';

interface CommentCardProps {
    comment: Comment;
    review: Review;
}

export default function CommentCard({ comment, review }: CommentCardProps): ReactElement {
    const [editingComment, setEditingComment] = useState<boolean>(false);

    // Comment card editing menu
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);

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
                <MenuItem disabled={editingComment} onClick={handleEditComment} disableRipple>
                    Edit comment
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDeleteComment} disableRipple>
                    <Typography sx={{ fontWeight: 'bold', color: (t) => t.palette.error.main }}>
                        Delete comment
                    </Typography>
                </MenuItem>
            </Menu>
        </Card>
    );
}
