import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useHistory } from 'react-router';
import { useAuth } from '../../hooks/auth';
import { ReactElement, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import ErrorBanner from '../../components/ErrorBanner';
import ControlledTextField from '../../components/ControlledTextField';
import ControlledAutocomplete from '../../components/ControlledAutocomplete';
import { usePostPublication } from '../../lib/api/publications/publications';
import { ICreatePublication, CreatePublicationSchema } from '../../validators/publication';
import FieldLabel from '../../components/FieldLabel';

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

    const onSubmit: SubmitHandler<ICreatePublication> = async (data) => await mutateAsync({ data });

    // When the request completes, we want to re-direct the user to the publication page
    useEffect(() => {
        if (isError && error) {
            if (typeof error.errors !== 'undefined') {
                for (const [errorField, errorObject] of Object.entries(error.errors)) {
                    setError(errorField as keyof ICreatePublication, { type: 'manual', message: errorObject.message });
                }
            }
        } else if (data) {
            history.push({ pathname: `/${auth.session.username}/${data.publication.name}` });
        }
    }, [data, isError]);

    return (
        <form style={{ width: '100%', marginTop: '8px' }} onSubmit={handleSubmit(onSubmit)}>
            <Grid container maxWidth={'lg'}>
                <Grid item xs={12} sx={{pt: 1}}>
                    <FieldLabel label="Publication name" />
                    <Typography variant={'body2'}>This will be used to publicly identify the publication.</Typography>
                    <ControlledTextField name="name" control={control} />
                </Grid>
                <Grid item xs={12} sx={{pt: 1}}>
                    <FieldLabel label="Publication title" />
                    <Typography variant={'body2'}>This is the title of the publication.</Typography>
                    <ControlledTextField name="title" control={control} />
                </Grid>
                <Grid item xs={12} sx={{pt: 1}}>
                    <FieldLabel label="Introduction" required={false} />
                    <Typography variant={'body2'}>Write a small introduction for the publication</Typography>
                    <ControlledTextField
                        name="introduction"
                        control={control}
                        textFieldProps={{
                            rows: 4,
                            multiline: true,
                        }}
                    />
                </Grid>
                <Grid item xs={12} sx={{pt: 1}}>
                    <FieldLabel label="Revision" />
                    <Typography variant={'body2'}>Add a revision tag to the publication</Typography>
                    <ControlledTextField name="revision" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <FieldLabel label="Collaborators" required={false} />
                    <Typography variant={'body2'}>Add collaborators to publication</Typography>
                    <ControlledAutocomplete name="collaborators" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{pt: 1}}>
                        <LoadingButton
                            loading={isLoading || isSubmitting}
                            disabled={!isValid}
                            sx={{ mr: 1 }}
                            variant="contained"
                            type={'submit'}
                        >
                            Create
                        </LoadingButton>
                        <Button variant="outlined" href="/">
                            Cancel
                        </Button>
                    </Box>
                    {isError && error && <ErrorBanner message={error.message} />}
                </Grid>
            </Grid>
        </form>
    );
}
