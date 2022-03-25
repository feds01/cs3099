import CollaboratorInput from '../../components/CollaboratorInput';
import ControlledTextField from '../../components/ControlledTextField';
import ErrorBanner from '../../components/ErrorBanner';
import FieldLabel from '../../components/FieldLabel';
import { useNotificationDispatch } from '../../contexts/notification';
import { usePublicationDispatch } from '../../contexts/publication';
import { Publication } from '../../lib/api/models';
import { usePatchPublicationUsernameName } from '../../lib/api/publications/publications';
import { applyErrorsToForm } from '../../lib/utils/error';
import {
    IEditPublication as IUpdatePublication,
    EditPublicationSchema as UpdatePublicationSchema,
} from '../../validators/publication';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import { ReactElement, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import MarkdownField from '../../components/MarkdownField';

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
    } = useForm<IUpdatePublication>({
        resolver: zodResolver(UpdatePublicationSchema),
        reValidateMode: 'onChange',
        mode: 'onChange',
        defaultValues: publication,
    });

    const { isLoading, isError, data, error, mutateAsync } = usePatchPublicationUsernameName();

    useEffect(() => {
        if (isError && error) {
            if (typeof error.errors !== 'undefined') {
                // @@Investigate: collaborators.${number} might not apply to the actual field??
                applyErrorsToForm(error.errors, setError);
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

    const onSubmit: SubmitHandler<IUpdatePublication> = async (data) => {
        const { collaborators, ...rest } = data;
        await mutateAsync({
            username,
            name,
            data: {
                ...rest,
                collaborators: collaborators?.map((x) => (typeof x === 'string' ? x : x.username)),
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Grid container maxWidth={'lg'}>
                <Grid item xs={12}>
                    <FieldLabel label="Publication title" />
                    <ControlledTextField name="title" control={control} />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="Revision" />
                    <ControlledTextField name="revision" control={control} />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="Publication about" required={false} />
                    <ControlledTextField name="about" control={control} />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="Collaborators" required={false} />
                    <CollaboratorInput name="collaborators" control={control} />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="Publication description" required={false} />
                    <Controller
                        render={({ field: { value, onChange } }) => (
                            <MarkdownField contents={value} onChange={onChange} />
                        )}
                        name="introduction"
                        control={control}
                    />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
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
