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


export default function CreatePublicationForm(): ReactElement {
    const auth = useAuth();

    const history = useHistory();
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<ICreatePublication>({
        resolver: zodResolver(CreatePublicationSchema),
        reValidateMode: 'onBlur',
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
        if (!isError && typeof data !== 'undefined') {
            history.push({ pathname: `/${auth.session.username}/${data.publication.name}` });
        }
    }, [data]);

    return (
        <form style={{ width: '100%', marginTop: '8px' }} onSubmit={handleSubmit(onSubmit)}>
            <Grid container maxWidth={'lg'}>
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Publication Name
                    </Typography>
                    <Typography variant={'body2'}>This will be used to publicly identify the publication.</Typography>
                    <ControlledTextField name="name" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Publication Title
                    </Typography>
                    <Typography variant={'body2'}>This is the title of the publication.</Typography>
                    <ControlledTextField name="title" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Introduction
                    </Typography>
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
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Revision
                    </Typography>
                    <Typography variant={'body2'}>Add a revision tag to the publication</Typography>
                    <ControlledTextField name="revision" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Collaborators
                    </Typography>
                    <Typography variant={'body2'}>Add collaborators to publication</Typography>
                    <ControlledAutocomplete name="collaborators" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <Box>
                        <LoadingButton
                            loading={isLoading || isSubmitting}
                            sx={{ mt: 1, mr: 1 }}
                            variant="contained"
                            type={'submit'}
                        >
                            Create
                        </LoadingButton>
                        <Button disabled={isLoading} sx={{ mt: 1 }} variant="outlined" href="/">
                            Cancel
                        </Button>
                    </Box>
                    {isError && <ErrorBanner message={error?.message || 'Something went wrong.'} />}
                </Grid>
            </Grid>
        </form>
    );
}
