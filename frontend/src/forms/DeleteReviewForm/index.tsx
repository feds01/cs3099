import ConfirmationDialogue from '../../components/ConfirmationDialogue';
import { useNotificationDispatch } from '../../hooks/notification';
import { useDeleteReviewId } from '../../lib/api/reviews/reviews';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

type Props = {
    reviewId: string;
};

export default function DeletePublicationForm({ reviewId }: Props) {
    const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);

    const history = useHistory();
    const notificationDispatcher = useNotificationDispatch();

    const { isLoading, isSuccess, isError, mutateAsync } = useDeleteReviewId();

    useEffect(() => {
        if (isError) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't delete review" },
            });
        } else if (!isLoading && isSuccess) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully deleted review' },
            });
            setDialogueOpen(false);
            history.push('/');
        }
    }, [isLoading, isError, isSuccess]);

    const onConfirm = async () => await mutateAsync({ id: reviewId });

    return (
        <>
            <Button variant="contained" onClick={() => setDialogueOpen(true)} color="error">
                Delete Review
            </Button>
            <ConfirmationDialogue
                isOpen={dialogueOpen}
                onClose={() => setDialogueOpen(false)}
                submitEnabled={isLoading}
                onConfirm={onConfirm}
                message={'Are you sure you want to delete this review?'}
                title={'Delete review'}
            />
        </>
    );
}
