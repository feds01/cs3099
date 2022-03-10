import ControlledTextField from '../../components/ControlledTextField';
import FieldLabel from '../../components/FieldLabel';
import { usePublicationState } from '../../contexts/publication';
import { usePostPublicationUsernameNameRevise } from '../../lib/api/publications/publications';
import { IRevisePublication, RevisePublicationSchema } from '../../validators/publication';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

type RevisePublicationFormProps = {
    onClose: () => void;
    onCompletion?: () => void;
    isOpen: boolean;
};

export default function RevisePublicationForm({ isOpen, onClose, onCompletion }: RevisePublicationFormProps) {
    const {
        publication: {
            owner: { username },
            name,
        },
    } = usePublicationState();
    const history = useHistory();

    const {
        control,
        handleSubmit,
        setError,
        formState: { isSubmitting, isValid },
    } = useForm<IRevisePublication>({
        resolver: zodResolver(RevisePublicationSchema),
        reValidateMode: 'onChange',
        mode: 'onChange',
        defaultValues: {
            revision: '',
            changelog: '',
        },
    });

    const { isLoading, isError, data, error, mutateAsync } = usePostPublicationUsernameNameRevise();

    const onSubmit: SubmitHandler<IRevisePublication> = async (data) => await mutateAsync({ username, name, data });

    // When the request completes, we want to re-direct the user to the publication page
    useEffect(() => {
        if (isError && error) {
            if (typeof error.errors !== 'undefined') {
                for (const [errorField, errorObject] of Object.entries(error.errors)) {
                    setError(errorField as keyof IRevisePublication, { type: 'manual', message: errorObject.message });
                }
            }
        } else if (data) {
            onClose();

            if (typeof onCompletion === 'function') {
                onCompletion();
            } else {
                history.push({ pathname: `/${username}/${data.publication.name}` });
            }
        }
    }, [isLoading, isError]);

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Revise publication</DialogTitle>
                <DialogContent>
                    <Grid container maxWidth={'lg'}>
                        <Grid item xs={12} sx={{ pt: 1 }}>
                            <FieldLabel label="Publication revision tag" required />
                            <Typography variant={'body2'}>
                                This will be used to publicly identify the publication.
                            </Typography>
                            <ControlledTextField name="revision" control={control} />
                        </Grid>
                        <Grid item xs={12} sx={{ pt: 1 }}>
                            <FieldLabel label="Changelog" />
                            <Typography variant={'body2'}>
                                This is a summary of what changed between this revision and the current.
                            </Typography>
                            <ControlledTextField name="changelog" control={control} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" variant={'text'} onClick={onClose}>
                        Cancel
                    </Button>
                    <LoadingButton
                        loading={isLoading || isSubmitting}
                        disabled={!isValid}
                        color="primary"
                        variant={'contained'}
                        type="submit"
                    >
                        Revise
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}
