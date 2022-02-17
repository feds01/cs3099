import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

type ConfirmationDialogueProps = {
    isOpen: boolean;
    submitEnabled: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    title: string;
    confirmationLabel?: string;
};

export default function ConfirmationDialogue({
    title,
    message,
    confirmationLabel = 'Confirm',
    isOpen,
    submitEnabled,
    onClose,
    onConfirm,
}: ConfirmationDialogueProps) {
    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{message}</DialogContent>
            <DialogActions>
                <Button color="secondary" variant={'text'} onClick={onClose}>
                    Cancel
                </Button>
                <LoadingButton loading={submitEnabled} color="primary" variant={'contained'} onClick={onConfirm}>
                    {confirmationLabel}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
