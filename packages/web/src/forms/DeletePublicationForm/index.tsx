import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useHistory } from 'react-router';
import { useEffect, useState } from 'react';
import { Publication } from '../../lib/api/models';
import { useNotificationDispatch } from '../../contexts/notification';
import ConfirmationDialogue from '../../components/ConfirmationDialogue';
import { useDeletePublicationUsernameName, useDeletePublicationUsernameNameAll } from '../../lib/api/publications/publications';
import { expr } from '../../lib/utils/expr';

type DeletePublicationFormProps = {
    /** The publication that is being referenced when it is deleted. */
    publication: Publication;
    /** Whether or not the entire publication is deleted when the user confirms the operation */
    deleteAll?: boolean;
    /** Function to call when the operation completes */
    onCompletion?: () => void;
};

export default function DeletePublicationForm({ publication, deleteAll = false, onCompletion }: DeletePublicationFormProps) {
    const {
        name,
        owner: { username },
    } = publication;

    const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);

    const history = useHistory();
    const notificationDispatcher = useNotificationDispatch();

    const { isLoading, isSuccess, isError, mutateAsync } = expr(() => {
      if (deleteAll) {
        return useDeletePublicationUsernameNameAll;
      } else {
        return useDeletePublicationUsernameName;
      }
    })();

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

    const onConfirm = async () => await mutateAsync({ username, name, params: { revision: publication.revision } });

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
