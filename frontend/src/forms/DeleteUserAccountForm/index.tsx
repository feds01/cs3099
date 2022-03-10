import ConfirmationDialogue from '../../components/ConfirmationDialogue';
import { useNotificationDispatch } from '../../contexts/notification';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { useDeleteUserUsername } from '../../lib/api/users/users';
import { useDispatchAuth } from '../../contexts/auth';

type DeleteUserAccountFormProps = {
    username: string;
};

export default function DeletePublicationForm({ username }: DeleteUserAccountFormProps) {
    const [dialogueOpen, setDialogueOpen] = useState(false);
    const { isLoading, isSuccess, isError, mutateAsync } = useDeleteUserUsername();

    const notificationDispatcher = useNotificationDispatch();
    const authDispatcher = useDispatchAuth();

    useEffect(() => {
        if (isError) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't delete account " },
            });
        } else if (!isLoading && isSuccess) {
            setDialogueOpen(false);

            // Remove the user session as soon as we have deleted the account
            authDispatcher({ type: "logout"});
        }
    }, [isLoading, isError, isSuccess]);

    const onConfirm = async () => await mutateAsync({ username });

    return (
        <Box>
            <Button sx={{ mt: 1, mr: 1 }} variant="contained" onClick={() => setDialogueOpen(true)} color="error">
                Delete Account
            </Button>
            <ConfirmationDialogue
                isOpen={dialogueOpen}
                onClose={() => setDialogueOpen(false)}
                submitEnabled={isLoading}
                onConfirm={onConfirm}
                message={'Are you sure you want to delete your account?'}
                title={'Delete account'}
            />
        </Box>
    );
}
