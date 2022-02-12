import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import CommentField from '../CommentField';
import { useReviewDispatch } from '../../hooks/review';
import { ReactElement, useEffect, useState } from 'react';
import { usePutReviewIdComment } from '../../lib/api/reviews/reviews';
import { useNotificationDispatch } from '../../hooks/notification';
import { usePatchCommentId } from '../../lib/api/comments/comments';
import { SxProps, Theme } from '@mui/material';

type CommentEditorProps = {
    reviewId: string;
    location?: number;
    filename?: string;
    onClose: () => void;
    contents?: string;
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
            <CommentField contents={contents} onChange={setValue} />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', pt: 1, pb: 1 }}>
                <Button variant="outlined" sx={{ mr: 1 }} onClick={onClose}>
                    Cancel
                </Button>
                <LoadingButton variant="contained" loading={commentQuery.isLoading} onClick={onSubmitComment}>
                    Submit
                </LoadingButton>
            </Box>
        </Box>
    );
}
