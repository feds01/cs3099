import { z } from 'zod';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { User } from '../../lib/api/models';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import CircularProgress from '@mui/material/CircularProgress';
import { usePostAuthRegister } from '../../lib/api/auth/auth';
import { SubmitHandler, useForm } from 'react-hook-form';
import ControlledPasswordField from '../ControlledPasswordField';
import ControlledTextField from '../ControlledTextField';
import React, { ReactElement, useEffect } from 'react';

const RegisterSchema = z
    .object({
        firstName: z.string().nonempty().max(32),
        lastName: z.string().nonempty().max(32),
        email: z.string().email(),
        username: z.string().nonempty().max(50),
        password: z.string().min(1),
        confirm: z.string().min(1),
    })
    .superRefine((val, ctx) => {
        // TODO: check that the username and email are unique

        // check that the password and confirmed password match
        if (val.password !== val.confirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['confirm'],
                message: "Passwords don't match.",
            });
        }
    });

type IRegisterForm = z.infer<typeof RegisterSchema>;

interface Props {
    onSuccess: (session: User, token: string, refreshToken: string) => void;
}

export default function RegisterForm({ onSuccess }: Props): ReactElement {
    const { control, handleSubmit } = useForm<IRegisterForm>({
        resolver: zodResolver(RegisterSchema),
    });

    const { isLoading, isError, data: response, error, mutateAsync } = usePostAuthRegister();

    useEffect(() => {
        // Check here if an error occurred, otherwise call the onSuccess function...
        if (isError) {
            // TODO: transform the errors into appropriate values
            console.log(error);
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
                    <Grid item xs={12} md={6}>
                        <Typography variant={'body2'}>
                            First name
                        </Typography>
                        <ControlledTextField name="firstName" control={control} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant={'body2'}>
                            Last name
                        </Typography>
                        <ControlledTextField name="lastName" control={control} />
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                        <Typography variant={'body2'}>
                            Username
                        </Typography>
                        <ControlledTextField name="username" control={control} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant={'body2'}>
                            Email
                        </Typography>
                        <ControlledTextField name="email" control={control} />
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                        <Typography variant={'body2'}>
                            Password
                        </Typography>
                        <ControlledPasswordField name="password" control={control} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant={'body2'}>
                            Confirm password
                        </Typography>
                        <ControlledPasswordField name="confirm" control={control} />
                    </Grid>
                </Grid>
                <Box sx={{pt: 2}}>
                    <Button type={'submit'} disabled={isLoading} variant="contained" color="primary" fullWidth={false}>
                        {!isLoading ? 'Create Account' : <CircularProgress color="inherit" size={14} />}
                    </Button>
                </Box>
            </Box>
            {isError && (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    <strong>{error!.message || 'Something went wrong'}</strong>
                </Alert>
            )}
        </form>
    );
}
