import { z } from 'zod';
import { ReactElement, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { useAuth } from '../../hooks/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ControlledTextField from '../ControlledTextField';
import ControlledAutocomplete from '../ControlledAutocomplete';
import { usePostPublication } from '../../lib/api/publications/publications';
import ErrorBanner from '../ErrorBanner';
import { useHistory } from 'react-router';

type Props = {};

const CreatePublicationSchema = z.object({
    name: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9_-]*$/, { message: 'Name must be URL safe.' }),
    title: z.string().min(1).max(200),
    introduction: z.string().optional(),
    revision: z.string().optional(),
    collaborators: z.array(z.string()),
});

type CreatePublication = z.infer<typeof CreatePublicationSchema>;

export default function CreatePublicationForm(props: Props): ReactElement {
    const auth = useAuth();

    const history = useHistory();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreatePublication>({
        resolver: zodResolver(CreatePublicationSchema),
        defaultValues: {
            collaborators: [],
        },
    });

    const { isLoading, isError, data, error, mutateAsync } = usePostPublication();

    const onSubmit: SubmitHandler<CreatePublication> = async (data) => await mutateAsync({ data });
    
    // When the request completes, we want to re-direct the user to the publication page
    useEffect(() => {
        if (!isError && typeof data !== 'undefined') {
            history.push({pathname: `/${auth.session.username}/${data.publication.name}`})
        }
    }, [data])

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
                        <Button disabled={isLoading} sx={{ mt: 1, mr: 1 }} variant="contained" type={'submit'}>
                            {isLoading ? ( <CircularProgress variant="determinate" color="inherit" size={14} /> ) : "Create"}
                        </Button>
                        <Button disabled={isLoading} sx={{ mt: 1 }} variant="outlined" type={'submit'}>
                            Cancel
                        </Button>
                    </Box>
                    {isError && (
                        <ErrorBanner message={error?.message || "Something went wrong."} />
                    )}
                </Grid>
            </Grid>
        </form>
    );
}
