import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import CommentField from '../CommentField';
import { Review } from '../../lib/api/models';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { useReviewDispatch } from '../../hooks/review';
import { useNotificationDispatch } from '../../hooks/notification';
import { usePutReviewIdComment } from '../../lib/api/reviews/reviews';

type SubmissionPopOverProps = {
    open: boolean;
    anchorEl: Element | null;
    onClose: () => void;
    onSubmission: () => void;
    review: Review;
};

export default function SubmissionPopOver({ open, anchorEl, review, onClose, onSubmission }: SubmissionPopOverProps) {
    const { refetch } = useReviewDispatch();
    const [comment, setComment] = useState<string>('');
    const notificationDispatcher = useNotificationDispatch();

    const postComment = usePutReviewIdComment();

    useEffect(() => {
        if (!postComment.isLoading && postComment.data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully posted comment' },
            });

            refetch();
        } else if (postComment.isError && postComment.error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: 'Failed to post comment' },
            });
        }
    }, [postComment.data, postComment.isLoading]);

    const handleSubmit = async () => {
        if (comment !== '') {
            // First post the comment and then fire the on-success
            await postComment.mutateAsync({
                id: review.id,
                data: {
                    contents: comment,
                },
            });
        }

        onSubmission();
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                    Finish your review
                </Typography>
                <Typography variant={'body2'} sx={{ pb: 1 }}>
                    You can leave a general comment on the review
                </Typography>
                <CommentField contents={''} onChange={setComment} />
                <Box sx={{ pt: 1, pb: 1 }}>
                    <Button variant="outlined" sx={{ mr: 1 }} onClick={onClose}>
                        Cancel
                    </Button>
                    <LoadingButton variant={'contained'} loading={postComment.isLoading} onClick={handleSubmit}>
                        Submit
                    </LoadingButton>
                </Box>
            </Box>
        </Popover>
    );
}