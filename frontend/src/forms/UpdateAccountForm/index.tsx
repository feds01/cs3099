import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { User } from '../../lib/api/models';
import { useDispatchAuth } from '../../hooks/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { usePatchUserUsername } from '../../lib/api/users/users';
import { useNotificationDispatch } from '../../hooks/notification';
import ControlledTextField from '../../components/ControlledTextField';
import { AccountUpdate, AccountUpdateSchema } from '../../validators/updateAccount';

interface AccountUpdateFormProps {
    session: User;
}

export function AccountUpdateForm({ session }: AccountUpdateFormProps) {
    const notificationDispatcher = useNotificationDispatch();
    const authDispatcher = useDispatchAuth();
    const {
        control,
        handleSubmit,
        formState: { isValid, isSubmitting },
    } = useForm<AccountUpdate>({
        resolver: zodResolver(AccountUpdateSchema),
        defaultValues: { ...session },
    });

    // This is the query to the backend
    const { isLoading, isError, data: response, error, mutateAsync } = usePatchUserUsername();

    // This function will be called once the form is ready to submit
    const onSubmit: SubmitHandler<AccountUpdate> = async (data) =>
        await mutateAsync({ username: session.username, data });

    useEffect(() => {
        if (isError) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't update profile" },
            });
        } else if (!isLoading && response) {
            authDispatcher({ type: 'data', data: response.user });
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Updated profile' },
            });
        }
    }, [isLoading, isError]);

    return (
        <form style={{ width: '100%' }} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3} sx={{ paddingTop: 2 }}>
                <Grid item xs={12} sm={5}>
                    <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                        Current status
                    </Typography>
                    <Typography variant={'body1'}>
                        This message will appear on your profile and throughout the interface.
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Your status
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <ControlledTextField control={control} name="status" />
                    </Grid>
                </Grid>
                <Divider />
                <Grid item xs={12} sm={5}>
                    <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                        Main settings
                    </Typography>
                    <Typography variant={'body1'}>This information will appear on your profile.</Typography>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Username
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <ControlledTextField
                            control={control}
                            name="username"
                            textFieldProps={{
                                helperText: 'Enter a username that can be used to identify you on the platform.',
                            }}
                        />
                    </Grid>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Name
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <ControlledTextField
                            control={control}
                            name="firstName"
                            textFieldProps={{
                                helperText: 'Enter your first name',
                            }}
                        />
                    </Grid>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Surname
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <ControlledTextField
                            control={control}
                            name="lastName"
                            textFieldProps={{
                                helperText: 'Enter your last name',
                            }}
                        />
                    </Grid>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Email
                    </Typography>
                    <Grid item xs={12} md={8}>
                        <ControlledTextField
                            control={control}
                            name="email"
                            textFieldProps={{
                                helperText:
                                    'Enter your work email. This will be used by other users to contact you outside the platform.',
                            }}
                        />
                    </Grid>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        About
                    </Typography>
                    <Grid item xs={12}>
                        <ControlledTextField
                            control={control}
                            name="about"
                            textFieldProps={{
                                helperText: 'Tell us about yourself in fewer than 250 characters',
                            }}
                        />
                    </Grid>
                </Grid>
                <Divider variant="fullWidth" />
                <Grid item xs={12}>
                    <Box>
                        <LoadingButton
                            sx={{ marginRight: 1 }}
                            loading={!isValid || isSubmitting}
                            type="submit"
                            variant="contained"
                        >
                            Update profile
                        </LoadingButton>
                        <Button variant="outlined" href="/">
                            Cancel
                        </Button>
                    </Box>
                    {isError && (
                        <Alert severity="error" sx={{ marginTop: 2, maxWidth: 500 }}>
                            <AlertTitle>Error</AlertTitle>
                            <strong>{error!.message || 'Something went wrong'}</strong>
                        </Alert>
                    )}
                </Grid>
            </Grid>
        </form>
    );
}
