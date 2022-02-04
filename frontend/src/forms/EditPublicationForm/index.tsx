import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useAuth } from '../../hooks/auth';
import { ReactElement, useEffect } from 'react';
import { Publication } from '../../lib/api/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import ErrorBanner from '../../components/ErrorBanner';
import ControlledTextField from '../../components/ControlledTextField';
import ControlledAutocomplete from '../../components/ControlledAutocomplete';
import { usePostPublication } from '../../lib/api/publications/publications';
import { EditPublication, EditPublicationSchema } from '../../validators/publication';

interface Props {
    publication: Publication
}

export default function EditPublicationForm(): ReactElement {
    const auth = useAuth();

    const {
        control,
        handleSubmit, 
        formState: { isSubmitting },
    } = useForm<EditPublication>({
        resolver: zodResolver(EditPublicationSchema),
        reValidateMode: 'onBlur',
        defaultValues: {
            collaborators: [],
        },
    });

    const { isLoading, isError, data, error, mutateAsync } = usePostPublication();

    return (
        <form style={{ width: '100%', marginTop: '8px'}}>
            <Grid container maxWidth={'lg'}>
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold'}}>
                        Publication Title
                    </Typography>
                    <ControlledTextField name='title' control={control}/>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold'}}>
                        Publication Description
                    </Typography>
                    <ControlledTextField 
                        name='introduction' 
                        control={control}
                        textFieldProps={{
                            rows: 4,
                            multiline: true,
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold'}}>
                        Revision
                    </Typography>
                    <ControlledTextField name="revision" control={control} />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold'}}>
                        Collaborators
                    </Typography>
                    <ControlledAutocomplete name='collaborators' control={control}/>
                </Grid>
                <Grid item xs={12}>
                    <Box>
                        <LoadingButton 
                            loading={isLoading || isSubmitting}
                            sx={{ mt: 1, mr: 1}}
                            variant="contained"
                            type={'submit'}
                        >
                            Save Changes
                        </LoadingButton>
                        <Button disabled={isLoading} sx={{ mt: 1 }} variant="outlined" type={'submit'}>
                            Cancel
                        </Button>
                    </Box>
                    {isError && <ErrorBanner message={error?.message || 'Something went wrong.'} />}
                </Grid>
            </Grid>
        </form>
    );
}