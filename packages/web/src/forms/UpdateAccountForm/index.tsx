import ControlledTextField from '../../components/ControlledTextField';
import FieldLabel from '../../components/FieldLabel';
import { useNotificationDispatch } from '../../contexts/notification';
import { User } from '../../lib/api/models';
import { usePatchUserUsername } from '../../lib/api/users/users';
import { AccountUpdate, UserUpdateSchema } from '../../validators/user';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useHistory } from 'react-router-dom';
import { applyErrorsToForm } from '../../lib/utils/error';
import { useDispatchAuth } from '../../contexts/auth';

interface AccountUpdateFormProps {
    user: User;
    isSelf: boolean;
    refetch: () => void;
}

export function AccountUpdateForm({ user, isSelf, refetch }: AccountUpdateFormProps) {
    const history = useHistory();
    const authDispatcher = useDispatchAuth();
    const notificationDispatcher = useNotificationDispatch();

    const {
        control,
        handleSubmit,
        setError,
        formState: { isValid, isSubmitting },
    } = useForm<AccountUpdate>({
        reValidateMode: 'onChange',
        mode: 'onChange',
        resolver: zodResolver(UserUpdateSchema),
        defaultValues: { ...user },
    });

    // This is the query to the backend
    const { isLoading, isError, data: response, error, mutateAsync } = usePatchUserUsername();
    const onSubmit: SubmitHandler<AccountUpdate> = async (data) => await mutateAsync({ username: user.username, data });

    useEffect(() => {
        if (isError && error) {
            if (typeof error.errors !== 'undefined') {
                applyErrorsToForm(error.errors, setError);
            }

            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't update profile" },
            });
        } else if (!isLoading && response) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Updated profile' },
            });

            refetch();

            // If the user is a moderator/administrator and they are updating their
            // own account, we want to propagate the change to the state update
            // because they might change a critical user session and that might mean
            // we have to rebuild some parts of the UI
            if (isSelf) {
                authDispatcher({ type: 'data', data: response.user });
            } else {
                // In this case, if the user changes the username then we have to
                // re-direct the user to the 'new' page
                history.replace(`/account/${response.user.username}`);
            }
        }
    }, [isLoading, isError]);

    return (
        <form style={{ width: '100%' }} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ borderTop: '1px solid', borderColor: 'divider', pb: 2 }}>
                <Grid item xs={12} md={5}>
                    <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                        Current status
                    </Typography>
                    <Typography variant={'body1'}>
                        This message will appear on your profile and throughout the interface.
                    </Typography>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        {isSelf ? 'Your' : 'User'} status
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <ControlledTextField control={control} name="status" />
                    </Grid>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ borderTop: '1px solid', borderColor: 'divider', pb: 2 }}>
                <Grid item xs={12} md={5}>
                    <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                        Main settings
                    </Typography>
                    <Typography variant={'body1'}>This information will appear on your profile.</Typography>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Grid item xs={12} sm={8} md={6}>
                        <FieldLabel label={'Username'} />
                        <ControlledTextField
                            control={control}
                            name="username"
                            textFieldProps={{
                                helperText: 'Enter a username that can be used to identify you on the platform.',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={8} md={6}>
                        <FieldLabel label={'Name'} required={false} />
                        <ControlledTextField
                            control={control}
                            name="name"
                            textFieldProps={{
                                helperText: 'Enter your first name',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <FieldLabel label={'Email'} />
                        <ControlledTextField
                            control={control}
                            name="email"
                            textFieldProps={{
                                helperText:
                                    'Enter your work email. This will be used by other users to contact you outside the platform.',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FieldLabel label={'About'} required={false} />
                        <ControlledTextField
                            control={control}
                            name="about"
                            textFieldProps={{
                                multiline: true,
                                helperText: 'Tell us about yourself in fewer than 250 characters',
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ borderTop: '1px solid', borderColor: 'divider', pb: 2 }}>
                <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                        <Link to="/">
                            <Button variant="outlined" color="secondary">
                                Cancel
                            </Button>
                        </Link>
                        <LoadingButton
                            sx={{ ml: 1 }}
                            disabled={!isValid}
                            loading={isSubmitting}
                            type="submit"
                            variant="contained"
                        >
                            Update profile
                        </LoadingButton>
                    </Box>
                </Grid>
            </Grid>
        </form>
    );
}
