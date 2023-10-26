import { useAuth } from '../../contexts/auth';
import { useReviewState } from '../../contexts/review';
import { CommentAnchor } from '../../lib/api/models';
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
    /**
     * Relevant information about the current comment thread. This includes all the
     * comments in the current thread, the source anchor and source filename (if any)
     * and the id of the thread itself.
     */
    thread: CommentThread;
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

export default function CommentThreadRenderer({ contents, thread }: CommentThreadProps) {
    const { session } = useAuth();
    const { review } = useReviewState();

    // Comment reply mechanism
    const [replyingToComment, setReplyingToComment] = useState(false);

    const renderInlineSources = (filename: string, contents: string, anchor?: CommentAnchor) => {
        const renderFilename = () => (
            <Typography variant={'body1'} sx={{ fontWeight: 'bold', fontFamily: 'monospace', p: '4px 0', ml: 1 }}>
                {filename}
            </Typography>
        );

        if (typeof anchor === 'undefined') {
            return (
                <Box>
                    {renderFilename()}
                    <Divider />
                </Box>
            );
        }

        const range = selectLineRange(contents, anchor);
        if (typeof range !== 'string') return;

        return (
            <Box>
                {renderFilename()}
                <CodeRenderer contents={range} lineNumbers lineOffset={anchor.start - 1} filename={filename} />
                <Divider />
            </Box>
        );
    };

    return (
        <Card variant="outlined" sx={{ maxWidth: 800 }}>
            {typeof contents !== 'undefined' &&
                typeof thread.filename !== 'undefined' &&
                renderInlineSources(thread.filename, contents, thread.anchor)}
            {typeof contents === 'undefined' &&
                typeof thread.anchor !== 'undefined' &&
                thread.anchor.end - thread.anchor.start > 1 && (
                    <Box>
                        <Typography variant={'caption'} sx={{ ml: 1, color: 'grey !important' }}>
                            Comment on lines <span style={{ fontWeight: 'bold' }}>{thread.anchor.start}</span> to{' '}
                            <span style={{ fontWeight: 'bold' }}>{thread.anchor.end - 1}</span>
                        </Typography>
                        <Divider />
                    </Box>
                )}
            <CardContent>
                {thread.comments.map((comment) => {
                    return (
                        <Box key={comment.contents} sx={{ pt: 0.5, pb: 0.5 }}>
                            <CommentCard comment={comment} />
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
