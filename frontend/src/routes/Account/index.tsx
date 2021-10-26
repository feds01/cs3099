import React, { useEffect } from 'react';
import { z } from 'zod';
import { useAuth, useDispatchAuth } from '../../hooks/auth';
import PageLayout from '../../components/PageLayout';
import Grid from '@mui/material/Grid';
import { Alert, AlertTitle, Box, Button, Divider, TextField, Typography } from '@mui/material';
import UserAvatar from '../../components/UserAvatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { usePatchUserUsername } from '../../lib/api/users/users';
import { User } from '../../lib/api/models';

const AccountUpdateSchema = z.object({
    firstName: z.string().max(32).optional(),
    lastName: z.string().max(32).optional(),
    email: z.string().email().optional(),
    username: z.string().max(50).optional(),
    status: z.string().max(32).optional(),
    about: z.string().optional(),
});

type AccountUpdate = z.infer<typeof AccountUpdateSchema>;

// TODO: better UI feedback, we can use notifications to denote whether the request to update
//       succeeded or failed via snackbar notifications that appear for a bit on the screen and disappear.
function AccountUpdateForm({ session }: { session: User }) {
    const authDispatcher = useDispatchAuth();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AccountUpdate>({
        resolver: zodResolver(AccountUpdateSchema),
        defaultValues: { ...session },
    });

    const { isLoading, isError, data: response, error, mutateAsync } = usePatchUserUsername();
    const onSubmit: SubmitHandler<AccountUpdate> = async (data) =>
        await mutateAsync({ username: session.username, data });

    useEffect(() => {
        // Check here if an error occurred, otherwise call the onSuccess function...
        if (isError) {
            // TODO: transform the errors into appropriate values
            console.log(error);
        } else if (!isLoading && response) {
            authDispatcher({ type: 'data', data: response.user });
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
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    {...(errors.status && {
                                        error: true,
                                        helperText: errors.status.message,
                                    })}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        marginTop: 1,
                                        marginBottom: 1,
                                    }}
                                />
                            )}
                        />
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
                        <Controller
                            name="username"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    helperText={'Enter a username that can be used to identify you on the platform.'}
                                    {...(errors.username && {
                                        error: true,
                                        helperText: errors.username.message,
                                    })}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        marginTop: 1,
                                        marginBottom: 1,
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Name
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    helperText={'Enter your first name'}
                                    {...(errors.firstName && {
                                        error: true,
                                        helperText: errors.firstName.message,
                                    })}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        marginTop: 1,
                                        marginBottom: 1,
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Surname
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    helperText={'Enter your last name'}
                                    {...(errors.lastName && {
                                        error: true,
                                        helperText: errors.lastName.message,
                                    })}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        marginTop: 1,
                                        marginBottom: 1,
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Email
                    </Typography>
                    <Grid item xs={12} md={8}>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    helperText={
                                        'Enter your work email. This will be used by other users to contact you outside the platform.'
                                    }
                                    {...(errors.lastName && {
                                        error: true,
                                        helperText: errors.lastName.message,
                                    })}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        marginTop: 1,
                                        marginBottom: 1,
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        About
                    </Typography>
                    <Grid item xs={12}>
                        <Controller
                            name="about"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    helperText={'Tell us about yourself in fewer than 250 characters'}
                                    {...(errors.about && {
                                        error: true,
                                        helperText: errors.about.message,
                                    })}
                                    size="small"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    sx={{
                                        marginTop: 1,
                                        marginBottom: 1,
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
                <Divider variant="fullWidth" />
                <Grid item xs={12}>
                    <Box>
                        <Button sx={{ marginRight: 1 }} type="submit" variant="contained">
                            Update profile
                        </Button>
                        <Button variant="outlined" onClick={() => reset(session)}>
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

export default function Account() {
    const { session } = useAuth();

    return (
        <PageLayout sidebar={false}>
            <Box sx={{ p: 3, wordBreak: 'break-word' }}>
                <Typography variant={'h4'}>User Settings</Typography>
                <Divider />
                <Grid container spacing={3} sx={{ paddingTop: 2 }}>
                    <Grid item xs={12} sm={5}>
                        <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                            User Avatar
                        </Typography>
                        <Typography variant={'body1'}>
                            You can change your avatar here or remove the current avatar.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={7}>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <UserAvatar {...session} size={80} displayName={false} />
                            <Box sx={{ marginLeft: 2, flex: 1 }}>
                                <Typography variant={'h6'} sx={{ fontWeight: 'bold' }}>
                                    Upload new avatar
                                </Typography>
                                <Box>
                                    <Button variant="outlined" sx={{ marginRight: 1 }} component="label">
                                        Choose file...
                                        <input type="file" hidden />
                                    </Button>
                                    No file chosen.
                                </Box>
                                <Box sx={{ paddingBottom: 1 }}>
                                    <Typography variant={'caption'} sx={{ fontWeight: 'bold' }}>
                                        Maximum upload allowed is 300Kb.
                                    </Typography>
                                </Box>
                                <Button variant="outlined" size="small" color="error">
                                    Delete avatar
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                    <Divider />
                    <Grid item xs={12}>
                        <AccountUpdateForm session={session} />
                    </Grid>
                </Grid>
            </Box>
        </PageLayout>
    );
}
