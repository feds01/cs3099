import { useState } from 'react';
import Box from '@mui/material/Box';
import UserAvatar from '../UserAvatar';
import CommentCard from '../CommentCard';
import { useAuth } from '../../hooks/auth';
import CommentEditor from '../CommentEditor';
import { Review } from '../../lib/api/models';
import TextField from '@mui/material/TextField';
import { CommentThread } from '../../lib/utils/comment';
import { Card, CardContent, Divider } from '@mui/material';

type CommentThreadProps = {
    thread: CommentThread;
    review: Review;
};

export default function CommentThreadRenderer({ thread, review }: CommentThreadProps) {
    const { session } = useAuth();

    // Comment reply mechanism
    const [replyingToComment, setReplyingToComment] = useState(false);

    return (
        <Card variant="outlined" sx={{ maxWidth: 800 }}>
            <CardContent>
                {thread.comments.map((comment) => {
                    return (
                        <Box key={comment.contents} sx={{ pt: 0.5, pb: 0.5 }}>
                            <CommentCard review={review} comment={comment} />
                        </Box>
                    );
                })}
            </CardContent>
            <Box sx={{ width: '100%' }}>
                <Divider />
                {replyingToComment ? (
                    <CommentEditor
                        type={'reply'}
                        sx={{
                            p: 1
                        }}
                        reviewId={review.id}
                        commentId={thread.comments[thread.comments.length - 1].id}
                        onClose={() => setReplyingToComment(false)}
                    />
                ) : (
                    <Box
                        sx={{
                            p: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                        }}
                    >
                        <UserAvatar {...session} displayName={false} size={32} />
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
            </Box>
        </Card>
    );
}
