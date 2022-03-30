import CollaboratorInput from '../../components/CollaboratorInput';
import ControlledTextField from '../../components/ControlledTextField';
import ErrorBanner from '../../components/ErrorBanner';
import FieldLabel from '../../components/FieldLabel';
import { useAuth } from '../../contexts/auth';
import { usePostPublication } from '../../lib/api/publications/publications';
import { applyErrorsToForm } from '../../lib/utils/error';
import { ICreatePublication, CreatePublicationSchema } from '../../validators/publication';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ReactElement, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import MarkdownField from '../../components/MarkdownField';

export default function CreatePublicationForm(): ReactElement {
    const auth = useAuth();

    const history = useHistory();
    const {
        control,
        handleSubmit,
        setError,
        formState: { isSubmitting, isValid },
    } = useForm<ICreatePublication>({
        resolver: zodResolver(CreatePublicationSchema),
        reValidateMode: 'onChange',
        mode: 'onChange',
        defaultValues: {
            title: '',
            name: '',
            introduction: '',
            revision: '',
            collaborators: [],
        },
    });

    const { isLoading, isError, data, error, mutateAsync } = usePostPublication();

    const onSubmit: SubmitHandler<ICreatePublication> = async (data) => {
        const { collaborators, ...rest } = data;
        await mutateAsync({
            data: {
                ...rest,
                collaborators: collaborators.map((x) => (typeof x === 'string' ? x : x.username)),
            },
        });
    };

    // When the request completes, we want to re-direct the user to the publication page
    useEffect(() => {
        if (isError && error) {
            if (typeof error.errors !== 'undefined') {
                applyErrorsToForm(error.errors, setError);
            }
        } else if (data) {
            history.push({ pathname: `/${auth.session.username}/${data.publication.name}` });
        }
    }, [data, isError]);

    return (
        <form style={{ width: '100%', marginTop: '8px' }} onSubmit={handleSubmit(onSubmit)}>
            <Grid container maxWidth={'lg'}>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="Publication name" />
                    <Typography variant={'body2'}>This will be used to publicly identify the publication.</Typography>
                    <ControlledTextField name="name" control={control} />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="Publication title" />
                    <Typography variant={'body2'}>This is the title of the publication.</Typography>
                    <ControlledTextField name="title" control={control} />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="Revision" />
                    <Typography variant={'body2'}>Add a revision tag to the publication</Typography>
                    <ControlledTextField name="revision" control={control} />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="About" required={false} />
                    <Typography variant={'body2'}>Write a small about section for the publication</Typography>
                    <ControlledTextField name="about" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <FieldLabel label="Collaborators" required={false} />
                    <Typography variant={'body2'}>Add collaborators to publication</Typography>
                    <CollaboratorInput name="collaborators" control={control} />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <FieldLabel label="Introduction" required={false} />
                    <Typography variant={'body2'}>Write a introduction for the publication</Typography>
                    <Controller
                        render={({ field: { value, onChange } }) => (
                            <MarkdownField
                                autoFocus={false}
                                placeholder="Add introduction"
                                contents={value}
                                onChange={onChange}
                            />
                        )}
                        name="introduction"
                        control={control}
                    />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <LoadingButton
                        loading={isLoading || isSubmitting}
                        disabled={!isValid}
                        variant="contained"
                        type={'submit'}
                    >
                        Create
                    </LoadingButton>
                    {isError && error && <ErrorBanner message={error.message} />}
                </Grid>
            </Grid>
        </form>
    );
}
