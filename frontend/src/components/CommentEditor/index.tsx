import { useNotificationDispatch } from '../../hooks/notification';
import { useReviewDispatch } from '../../hooks/review';
import { usePatchCommentId } from '../../lib/api/comments/comments';
import { usePutReviewIdComment } from '../../lib/api/reviews/reviews';
import CommentField from '../CommentField';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactElement, useEffect, useState } from 'react';

/** Comment Editor properties */
type CommentEditorProps = {
    /** Relevant id of the review that the comment is on */
    reviewId: string;
    /** The anchor of the comment in the filename  */
    location?: number;
    /** Whether the comment is on a particular filename */
    filename?: string;
    /** Function invoked when closing the comment editor or a successful submission occurs */
    onClose: () => void;
    /** Whether the comment editor should automatically focus the comment input box */
    autoFocus?: boolean;
    /** Whether the editor should show a cancel button or not */
    uncancelable?: boolean;
    /** Initial comment contents */
    contents?: string;
    /** Any styles applied to the root of the comment editor */
    sx?: SxProps<Theme>;
} & (CommentReply | CommentModify | CommentPost);

type CommentReply = {
    type: 'reply';
    commentId: string;
};

type CommentModify = {
    type: 'modify';
    commentId: string;
};

type CommentPost = {
    type: 'post';
    commentId?: undefined;
};

type CommentQueryType = 'modify' | 'post' | 'reply';

const getCommentQuery = (queryType: CommentQueryType) => {
    switch (queryType) {
        case 'modify':
            return usePatchCommentId;
        case 'reply':
        case 'post':
            return usePutReviewIdComment;
    }
};

// https://codesandbox.io/s/react-mde-latest-forked-f9ti5?file=/src/index.js
export default function CommentEditor({
    contents = '',
    reviewId,
    filename,
    onClose,
    autoFocus = true,
    uncancelable,
    location,
    sx,
    ...rest
}: CommentEditorProps): ReactElement {
    const { refetch } = useReviewDispatch();
    const notificationDispatcher = useNotificationDispatch();

    const [value, setValue] = useState<string>(contents);

    const commentQuery = getCommentQuery(rest.type)();

    useEffect(() => {
        if (!commentQuery.isLoading && commentQuery.data) {
            refetch();

            if (rest.type === 'modify') {
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

            setValue('');
            onClose();
        } else if (commentQuery.isError && commentQuery.error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: 'Failed to post comment' },
            });
        }
    }, [commentQuery.data, commentQuery.isLoading]);

    const onSubmitComment = async () => {
        return await commentQuery.mutateAsync({
            id: rest.type !== 'modify' ? reviewId : rest.commentId,
            data: {
                filename,
                contents: value,
                ...(rest.type === 'reply' && { replying: rest.commentId }),
                ...(typeof location !== 'undefined' && { anchor: { start: location + 1, end: location + 2 } }),
            },
        });
    };

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <CommentField contents={contents} autoFocus={autoFocus} onChange={setValue} />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', pt: 1, pb: 1 }}>
                {!uncancelable && (
                    <Button variant="outlined" sx={{ mr: 1 }} onClick={onClose}>
                        Cancel
                    </Button>
                )}
                <LoadingButton
                    variant="contained"
                    disabled={value === ''}
                    loading={commentQuery.isLoading}
                    onClick={onSubmitComment}
                >
                    Submit
                </LoadingButton>
            </Box>
        </Box>
    );
}
