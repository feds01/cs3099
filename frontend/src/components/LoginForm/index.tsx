import React, { ReactElement } from 'react';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { User } from '../../lib/api/models';
import { usePostUserLogin } from '../../lib/api/users/users';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import PasswordField from '../PasswordField';

const LoginSchema = z.object({
    username: z.string().email(),
    password: z.string().nonempty(),
    rememberLogin: z.boolean(),
});

type ILoginForm = z.infer<typeof LoginSchema>;

interface Props {
    onSuccess: (session: User, token: string, refreshToken: string) => void;
}

export default function LoginForm({ onSuccess }: Props): ReactElement {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginForm>({
        resolver: zodResolver(LoginSchema),
    });

    const { isLoading, isError, data: response, error, mutate } = usePostUserLogin();

    const onSubmit: SubmitHandler<ILoginForm> = async (data) => {
        // Check here if an error occurred, otherwise call the onSuccess function...
        await mutate({ data });

        if (isError) {
            console.log(error);
        } else if (response) {
            console.log("here!")
            onSuccess(response.user, response.token, response.refreshToken);
        }
    };

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
                <Controller
                    name="username"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            {...field}
                            {...(errors.username && {
                                error: true,
                                helperText: errors.username.message,
                            })}
                            label="Email/Username"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                marginTop: 2,
                                marginBottom: 2,
                            }}
                        />
                    )}
                />
                <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <PasswordField
                            {...field}
                            {...(errors.password && {
                                error: true,
                                helperText: errors.password.message,
                            })}
                            sx={{
                                marginTop: 2,
                                marginBottom: 2,
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            label="Password"
                        />
                    )}
                />
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
                <Button type={'submit'} disabled={isLoading} variant="contained" color="primary" fullWidth>
                    {!isLoading ? 'Sign in' : <CircularProgress variant="determinate"  color="inherit" size={14} />}
                </Button>
            </Box>
            {isError && (
                <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                <strong>{error!.message || "Something went wrong"}</strong>
              </Alert>
            )}
        </form>
    );
}
