import { useAuth } from '../../hooks/auth';
import { CommentAnchor, Review } from '../../lib/api/models';
import { CommentThread } from '../../lib/utils/comment';
import CodeRenderer from '../CodeRenderer';
import CommentCard from '../CommentCard';
import CommentEditor from '../CommentEditor';
import UserAvatar from '../UserAvatar';
import { Card, CardContent, Divider, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

type CommentThreadProps = {
    thread: CommentThread;
    review: Review;
    /** If we provide the contents of the file, it can be rendered automatically using the
     *  the inline feature of the CommentThreadRenderer
     */
    contents?: string;
};

function selectLineRange(contents: string, range: CommentAnchor): string | undefined {
    const lines = contents.split(/\r\n|\r|\n/);

    if (range.start - 1 > lines.length || range.end - 1 > lines.length) {
        return;
    }

    return lines.slice(range.start - 1, range.end - 1).join('\n');
}

export default function CommentThreadRenderer({ contents, thread, review }: CommentThreadProps) {
    const { session } = useAuth();

    // Comment reply mechanism
    const [replyingToComment, setReplyingToComment] = useState(false);

    const renderInlineSources = (filename: string, contents: string, anchor: CommentAnchor) => {
        const range = selectLineRange(contents, anchor);

        if (typeof range !== 'string') {
            return;
        }

        return (
            <Box>
                <Typography variant={'body1'} sx={{ fontWeight: 'bold', p: '4px 0', ml: 1 }}>
                    {filename}
                </Typography>
                <CodeRenderer contents={range} lineNumbers lineOffset={anchor.start} filename={filename} />
                <Divider />
            </Box>
        );
    };

    return (
        <Card variant="outlined" sx={{ maxWidth: 800 }}>
            {typeof contents !== 'undefined' &&
                typeof thread.file !== 'undefined' &&
                typeof thread.anchor !== 'undefined' &&
                renderInlineSources(thread.file, contents, thread.anchor)}
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
                            p: 1,
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
