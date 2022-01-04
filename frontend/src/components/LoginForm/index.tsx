import { z } from 'zod';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import React, { ReactElement, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { User } from '../../lib/api/models';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { usePostAuthLogin } from '../../lib/api/auth/auth';
import ControlledTextField from '../ControlledTextField';
import ControlledPasswordField from '../ControlledPasswordField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const LoginSchema = z.object({
    username: z.string(),
    password: z.string().nonempty(),
    rememberLogin: z.boolean(),
});

type ILoginForm = z.infer<typeof LoginSchema>;

interface Props {
    onSuccess: (session: User, token: string, refreshToken: string, rememberUser: boolean) => void;
}

export default function LoginForm({ onSuccess }: Props): ReactElement {
    const { control, handleSubmit, getValues } = useForm<ILoginForm>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            rememberLogin: true,
        },
    });

    const { isLoading, isError, data: response, error, mutateAsync } = usePostAuthLogin();

    // TODO: try and do this in onSubmit instead of using an effect.
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
                        <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>
                            Username
                        </Typography>
                        <ControlledTextField name="username" control={control} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>
                            Password
                        </Typography>
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
                                defaultValue={false}
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
                <Button
                    type={'submit'}
                    sx={{ fontWeight: 'bold' }}
                    disabled={isLoading}
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    {!isLoading ? 'Sign in' : <CircularProgress variant="determinate" color="inherit" size={14} />}
                </Button>
            </Box>
            {isError && (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    <strong>{error?.message || 'Something went wrong'}</strong>
                </Alert>
            )}
        </form>
    );
}
