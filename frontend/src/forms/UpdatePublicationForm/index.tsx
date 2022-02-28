import ControlledAutocomplete from '../../components/ControlledAutocomplete';
import ControlledTextField from '../../components/ControlledTextField';
import ErrorBanner from '../../components/ErrorBanner';
import FieldLabel from '../../components/FieldLabel';
import { useNotificationDispatch } from '../../hooks/notification';
import { usePublicationDispatch } from '../../hooks/publication';
import { Publication } from '../../lib/api/models';
import { usePatchPublicationUsernameName } from '../../lib/api/publications/publications';
import { IEditPublication, EditPublicationSchema } from '../../validators/publication';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import { ReactElement, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface EditPublicationFormProps {
    publication: Publication;
}

export default function EditPublicationForm({ publication }: EditPublicationFormProps): ReactElement {
    const notificationDispatcher = useNotificationDispatch();

    const { refetch } = usePublicationDispatch();

    const {
        name,
        owner: { username },
    } = publication;

    const {
        control,
        handleSubmit,
        setError,
        formState: { isValid, isSubmitting },
    } = useForm<IEditPublication>({
        resolver: zodResolver(EditPublicationSchema),
        reValidateMode: 'onChange',
        mode: 'onChange',
        defaultValues: {
            ...publication,
            collaborators: publication.collaborators.map((item) => item.username)
        },
    });

    const { isLoading, isError, data, error, mutateAsync } = usePatchPublicationUsernameName();

    useEffect(() => {
        if (isError && error) {
            if (typeof error.errors !== 'undefined') {
                for (const [errorField, errorObject] of Object.entries(error.errors)) {
                    // @@Hack: In the event if one of the collaborators is invalid, we still want to set the
                    //         error. However, the backend will return collaborators.* as the error
                    if (errorField.startsWith('collaborators')) {
                        setError('collaborators', { type: 'manual', message: errorObject.message });
                    } else {
                        setError(errorField as keyof IEditPublication, {
                            type: 'manual',
                            message: errorObject.message,
                        });
                    }
                }
            }

            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't update publication" },
            });
        } else if (!isLoading && data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Updated publication' },
            });
            refetch();
        }
    }, [isLoading, isError, data]);

    const onSubmit: SubmitHandler<IEditPublication> = async (data) => await mutateAsync({ username, name, data });

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', marginTop: '8px' }}>
            <Grid container maxWidth={'lg'}>
                <Grid item xs={12}>
                    <FieldLabel label="Publication title" />
                    <ControlledTextField name="title" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <FieldLabel label="Publication about" required={false} />
                    <ControlledTextField name="about" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <FieldLabel label="Publication description" required={false} />
                    <ControlledTextField
                        name="introduction"
                        control={control}
                        textFieldProps={{
                            rows: 4,
                            multiline: true,
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FieldLabel label="Revision" />
                    <ControlledTextField name="revision" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <FieldLabel label="Collaborators" required={false} />
                    <ControlledAutocomplete name="collaborators" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <LoadingButton
                        loading={isLoading || isSubmitting}
                        disabled={!isValid}
                        sx={{ mt: 1, mr: 1 }}
                        variant="contained"
                        type={'submit'}
                    >
                        Save Changes
                    </LoadingButton>
                    {isError && <ErrorBanner message={error?.message || 'Something went wrong.'} />}
                </Grid>
            </Grid>
        </form>
    );
}
