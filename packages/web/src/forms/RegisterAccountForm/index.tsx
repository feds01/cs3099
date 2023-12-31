import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import { zodResolver } from '@hookform/resolvers/zod';

import { User } from '../../lib/api/models';
import { ReactElement, useEffect } from 'react';
import FieldLabel from '../../components/FieldLabel';
import ErrorBanner from '../../components/ErrorBanner';
import { SubmitHandler, useForm } from 'react-hook-form';
import { usePostAuthRegister } from '../../lib/api/auth/auth';
import ControlledTextField from '../../components/ControlledTextField';
import { IRegisterForm, RegisterSchema } from '../../validators/user';
import ControlledPasswordField from '../../components/ControlledPasswordField';
import { applyErrorsToForm } from '../../lib/utils/error';

interface RegisterAccountFormProps {
    onSuccess: (session: User, token: string, refreshToken: string) => void;
}

export default function RegisterForm({ onSuccess }: RegisterAccountFormProps): ReactElement {
    const {
        control,
        handleSubmit,
        setError,
        formState: { isSubmitting, isValid },
    } = useForm<IRegisterForm>({
        resolver: zodResolver(RegisterSchema),
        reValidateMode: 'onChange',
        mode: 'onChange',
        defaultValues: {
            username: '',
            email: '',
            name: '',
            password: '',
            confirm: '',
        },
    });
    const { isLoading, isError, data: response, error, mutateAsync } = usePostAuthRegister();

    useEffect(() => {
        // Check here if an error occurred, otherwise call the onSuccess function...
        if (isError && error && typeof error.errors !== 'undefined') {
                applyErrorsToForm(error.errors, setError);
        } else if (!isLoading && response) {
            onSuccess(response.user, response.token, response.refreshToken);
        }
    }, [isLoading, isError]);

    const onSubmit: SubmitHandler<IRegisterForm> = async (data) => await mutateAsync({ data });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: 2,
                    paddingBottom: 2,
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FieldLabel label={'Full Name'} required={false} />
                        <ControlledTextField name="name" control={control} />
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                        <FieldLabel label={'Username'} />
                        <ControlledTextField name="username" control={control} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FieldLabel label={'Email'} />
                        <ControlledTextField name="email" control={control} />
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                        <FieldLabel label={'Password'} />
                        <ControlledPasswordField name="password" control={control} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FieldLabel label={'Confirm password'} />
                        <ControlledPasswordField name="confirm" control={control} />
                    </Grid>
                </Grid>
                <Box sx={{ pt: 2 }}>
                    <LoadingButton
                        type={'submit'}
                        loading={isLoading || isSubmitting}
                        disabled={!isValid}
                        variant="contained"
                        color="primary"
                        fullWidth={false}
                    >
                        Create Account
                    </LoadingButton>
                </Box>
            </Box>
            {error && <ErrorBanner message={error.message} />}
        </form>
    );
}
