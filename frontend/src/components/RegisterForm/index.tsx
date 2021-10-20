import React, { ReactElement } from 'react';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import { User } from '../../lib/api/models';

/**
 * This is the password regex. It specifies that the password must be between the length
 * of 8 to 30 characters, whilst including at least one special character, one uppercase
 * character, and a digit.
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/;

const RegisterSchema = z
    .object({
        firstName: z.string().nonempty().max(32),
        lastName: z.string().nonempty().max(32),
        email: z.string().email(),
        username: z.string().nonempty().max(50),
        password: z.string().regex(PASSWORD_REGEX),
        passwordConfirm: z.string().regex(PASSWORD_REGEX),
    })
    .superRefine((val, ctx) => {
        // TODO: check that the username and email are unique

        // check that the password and confirmed password match
        if (val.password !== val.passwordConfirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['passwordConfirm'],
                message: "Passwords don't match.",
            });
        }
    });

type IRegisterForm = z.infer<typeof RegisterSchema>;

interface Props {
    onSuccess: (session: User, token: string, refreshToken: string) => void;
}

export default function RegisterForm(props: Props): ReactElement {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<IRegisterForm>({
        resolver: zodResolver(RegisterSchema),
    });

    const onSubmit: SubmitHandler<IRegisterForm> = (data) => {
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
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                        <Controller
                            name="firstName"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    {...(errors.firstName && {
                                        error: true,
                                        helperText: errors.firstName.message,
                                    })}
                                    fullWidth
                                    label="First name"
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
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Controller
                            name="lastName"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    {...(errors.lastName && {
                                        error: true,
                                        helperText: errors.lastName.message,
                                    })}
                                    fullWidth
                                    label="Last name"
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
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
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
                                    label="Username"
                                    fullWidth
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
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                                    label="Email"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    fullWidth
                                    sx={{
                                        marginTop: 2,
                                        marginBottom: 2,
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
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
                                    fullWidth
                                    type="password"
                                    label="Password"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Controller
                            name="passwordConfirm"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    {...(errors.passwordConfirm && {
                                        error: true,
                                        helperText: errors.passwordConfirm.message,
                                    })}
                                    fullWidth
                                    sx={{
                                        marginTop: 2,
                                        marginBottom: 2,
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    type="password"
                                    label="Confirm password"
                                />
                            )}
                        />
                    </Grid>
                </Grid>
                <div>
                    <Button type={'submit'} variant="contained" color="primary" fullWidth={false}>
                        Create Account
                    </Button>
                </div>
            </Box>
        </form>
    );
}
