import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useHistory } from 'react-router';
import React, { useEffect, useState } from 'react';
import { Publication } from '../../lib/api/models';
import { useNotificationDispatch } from '../../hooks/notification';
import ConfirmationDialogue from '../../components/ConfirmationDialogue';
import { useDeletePublicationUsernameName } from '../../lib/api/publications/publications';

type Props = {
    publication: Publication;
    onCompletion?: () => void;
};

export default function DeletePublicationForm({ publication, onCompletion }: Props) {
    const {
        name,
        owner: { username },
    } = publication;

    const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);

    const history = useHistory();
    const notificationDispatcher = useNotificationDispatch();

    const { isLoading, isSuccess, isError, mutateAsync } = useDeletePublicationUsernameName();

    useEffect(() => {
        if (isError) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't delete publication" },
            });
        } else if (!isLoading && isSuccess) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully deleted publication' },
            });
            setDialogueOpen(false);

            if (typeof onCompletion === 'function') {
                onCompletion();
            } else {
                history.push('/');
            }
        }
    }, [isLoading, isError, isSuccess]);

    const onConfirm = async () => await mutateAsync({ username, name, params: { draft: publication.draft } });

    return (
        <Box>
            <Button sx={{ mt: 1, mr: 1 }} variant="contained" onClick={() => setDialogueOpen(true)} color="error">
                Delete Publication
            </Button>
            <ConfirmationDialogue
                isOpen={dialogueOpen}
                onClose={() => setDialogueOpen(false)}
                submitEnabled={isLoading}
                onConfirm={onConfirm}
                message={'Are you sure you want to delete this publication?'}
                title={'Delete publication'}
            />
        </Box>
    );
}
