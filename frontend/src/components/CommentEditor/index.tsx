import ReactMde from 'react-mde';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MarkdownRenderer from '../MarkdownRenderer';
import { useReviewDispatch } from '../../hooks/review';
import { ReactElement, useEffect, useState } from 'react';
import { usePutReviewIdComment } from '../../lib/api/reviews/reviews';
import { useNotificationDispatch } from '../../hooks/notification';
import CircularProgress from '@mui/material/CircularProgress';
import { usePatchCommentId } from '../../lib/api/comments/comments';

/**
 * Prop types for the comment editor.
 */
interface CommentEditorProps {
    /**
     * Whether or not the comment editor is creating a new comment or modifying an old
     * entry.
     */
    isModifying: boolean;
    /**
     * The filename the comment is attached to.
     *
     * @@Future: change this is a optional field as general comments are a thing.
     */
    filename: string;
    /**
     * The location of the comment in the file.
     *
     * @@Future: this value should depend on whether a filename is provided or not.
     */
    location: number;
    /**
     * The ID of the review that is attached to the comment.
     */
    reviewId: string;

    /**
     * If the comment is being edited, then the comment id needs to be provided.
     */
    commentId?: string;

    /**
     * Optional initial content state of the comment editor
     */
    contents?: string;

    /**
     * Function that is fired when the comment is closed
     */
    onClose: () => void;
}

// TODO: in the future, add support for images
// TODO: we can also use the suggestion for usernames.

// https://codesandbox.io/s/react-mde-latest-forked-f9ti5?file=/src/index.js
export default function CommentEditor({
    isModifying = false,
    contents = '',
    reviewId,
    commentId,
    filename,
    onClose,
    location,
}: CommentEditorProps): ReactElement {
    const { refetch } = useReviewDispatch();
    const notificationDispatcher = useNotificationDispatch();

    const [value, setValue] = useState<string>(contents);
    const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');

    const postComment = usePutReviewIdComment();
    const updateComment = usePatchCommentId();

    useEffect(() => {
        if ((!postComment.isLoading && postComment.data) || (!updateComment.isLoading && updateComment.data)) {
            refetch();

            if (isModifying) {
                notificationDispatcher({
                    type: 'add',
                    item: { severity: 'success', message: 'Successfully updated comment.' },
                });
            } else {
                notificationDispatcher({
                    type: 'add',
                    item: { severity: 'success', message: 'Successfully posted comment' },
                });
            }
            onClose();
        } else if ((postComment.isError && postComment.error) || (updateComment.isError && updateComment.error)) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: 'Failed to post comment' },
            });
        }
    }, [postComment.data, postComment.isLoading, updateComment.data, updateComment.isLoading]);

    const onSubmit = async () => {
        if (isModifying && commentId) {
            return await updateComment.mutateAsync({
                id: commentId,
                data: { contents: value },
            });
        } else {
            return await postComment.mutateAsync({
                id: reviewId,
                data: { filename, anchor: { start: location + 1, end: location + 2 }, contents: value },
            });
        }
    };

    const isLoading = postComment.isLoading || updateComment.isLoading;

    return (
        <Box>
            <ReactMde
                value={value}
                onChange={setValue}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) => Promise.resolve(<MarkdownRenderer contents={markdown} />)}
                childProps={{
                    writeButton: {
                        tabIndex: -1,
                    },
                }}
            />
            <Box sx={{ pt: 1, pb: 1 }}>
                <Button variant="outlined" sx={{ mr: 1 }} onClick={onClose}>
                    Cancel
                </Button>
                <Button disabled={isLoading} onClick={onSubmit}>
                    {!isLoading ? 'Submit' : <CircularProgress variant="determinate" color="inherit" size={14} />}
                </Button>
            </Box>
        </Box>
    );
}
