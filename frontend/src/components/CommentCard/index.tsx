import { useNotificationDispatch } from '../../contexts/notification';
import { useReviewDispatch, useReviewState } from '../../contexts/review';
import { useDeleteCommentId } from '../../lib/api/comments/comments';
import { Comment } from '../../lib/api/models';
import CommentEditor from '../CommentEditor';
import MarkdownRenderer from '../MarkdownRenderer';
import UserAvatar from '../UserAvatar';
import UserLink from '../UserLink';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import React, { ReactElement, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { Permission, computeUserPermission } from '../../lib/utils/roles';

interface CommentCardProps {
    comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps): ReactElement {
    const { session } = useAuth();
    const { refetch } = useReviewDispatch();
    const { review } = useReviewState();
    const notificationDispatcher = useNotificationDispatch();

    // Permissions on the comment 
    const [permissions] = useState<Permission>(computeUserPermission(comment.author.id, session));

    // Comment card editing menu
    const [editingComment, setEditingComment] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    pb: 2,
                    fontFamily: 'Noto Sans !important',
                }}
            >
                <UserAvatar {...comment.author} displayName={false} size={32} />
                <Box sx={{ pl: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ height: 32, display: 'flex', alignItems: 'center', whiteSpace: 'normal' }}>
                            <UserLink user={comment.author} />
                            &nbsp;on {format(comment.updatedAt, 'do MMM')}
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
                        {permissions.modify && (
                            <IconButton
                                aria-label="comment-settings"
                                onClick={handleClick}
                                size={'small'}
                                aria-expanded={anchorEl ? 'true' : undefined}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        )}
                    </Box>
                    <Box sx={{ whiteSpace: 'pre-wrap' }}>
                        {editingComment ? (
                            <CommentEditor
                                type={'modify'}
                                filename={comment.filename}
                                contents={comment.contents}
                                {...(typeof comment.anchor !== 'undefined' && {
                                    location: comment.anchor.end - 1,
                                })}
                                reviewId={review.id}
                                commentId={comment.id}
                                onClose={() => setEditingComment(false)}
                            />
                        ) : (
                            <MarkdownRenderer contents={comment.contents} />
                        )}
                    </Box>
                </Box>
            </Box>
            <Menu
                id="comment-settings"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    disabled={!permissions.modify || editingComment || deleteComment.isLoading}
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
                    disabled={!permissions.delete || deleteComment.isLoading}
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
        </>
    );
}
