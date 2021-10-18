import React, { ReactElement } from 'react';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

interface Props {}

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().nonempty(),
    rememberLogin: z.boolean(),
});

type ILoginForm = z.infer<typeof LoginSchema>;

export default function LoginForm({}: Props): ReactElement {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginForm>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit: SubmitHandler<ILoginForm> = (data) => {
        console.log(data);
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
                    name="email"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            {...field}
                            {...(errors.email && {
                                error: true,
                                helperText: errors.email.message,
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
                        <TextField
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
                            type="password"
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
                <Button type={'submit'} variant="contained" color="primary" fullWidth>
                    Sign in
                </Button>
            </Box>
        </form>
    );
}
