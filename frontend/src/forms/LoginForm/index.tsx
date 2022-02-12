import { Link } from 'react-router-dom';
import { ReactElement, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import { zodResolver } from '@hookform/resolvers/zod';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { User } from '../../lib/api/models';
import { usePostAuthLogin } from '../../lib/api/auth/auth';
import { ILoginForm, LoginSchema } from '../../validators/login';
import ControlledTextField from '../../components/ControlledTextField';
import ControlledPasswordField from '../../components/ControlledPasswordField';
import ErrorBanner from '../../components/ErrorBanner';
import FieldLabel from '../../components/FieldLabel';

interface LoginFormProps {
    onSuccess: (session: User, token: string, refreshToken: string, rememberUser: boolean) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps): ReactElement {
    const {
        control,
        handleSubmit,
        getValues,
        formState: { isSubmitting, isValid },
    } = useForm<ILoginForm>({
        resolver: zodResolver(LoginSchema),
        mode: 'onChange',
        defaultValues: {
            username: '',
            password: '',
            rememberLogin: true,
        },
    });

    const { isLoading, data: response, error, mutateAsync } = usePostAuthLogin();

    useEffect(() => {
        if (!isLoading && typeof response !== 'undefined') {
            const rememberLogin = getValues('rememberLogin');

            onSuccess(response.user, response.token, response.refreshToken, rememberLogin);
        }
    }, [isLoading]);

    const onSubmit: SubmitHandler<ILoginForm> = async (data) => await mutateAsync({ data });

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
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <FieldLabel label="Username" />
                        <ControlledTextField name="username" control={control} />
                    </Grid>
                    <Grid item xs={12}>
                        <FieldLabel label="Password" />
                        <ControlledPasswordField name="password" control={control} />
                    </Grid>
                </Grid>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: 'row',
                        paddingBottom: 1,
                    }}
                >
                    <FormControlLabel
                        control={
                            <Controller
                                name="rememberLogin"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                )}
                            />
                        }
                        label="Remember me"
                    />
                    <Link to="/auth/forgot-password">Forgot Password?</Link>
                </Box>
                <LoadingButton
                    type={'submit'}
                    sx={{ fontWeight: 'bold' }}
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={!isValid}
                    loading={isLoading || isSubmitting}
                >
                    Sign In
                </LoadingButton>
            </Box>
            {error && <ErrorBanner message={error.message} />}
        </form>
    );
}
