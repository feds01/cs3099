import ErrorBanner from '../../components/ErrorBanner';
import PageLayout from '../../components/PageLayout';
import UserAvatar from '../../components/UserAvatar';
import { AccountUpdateForm } from '../../forms/UpdateAccountForm';
import { useAuth, useDispatchAuth } from '../../hooks/auth';
import { useNotificationDispatch } from '../../hooks/notification';
import { ApiErrorResponse } from '../../lib/api/models';
import { PostResourceUploadUsername200 } from '../../lib/api/models/postResourceUploadUsername200';
import { usePostResourceUploadUsername } from '../../lib/api/resources/resources';
import { useDeleteUserUsernameAvatar } from '../../lib/api/users/users';
import { ContentState } from '../../types/requests';
import { transformMutationIntoContentState } from '../../wrappers/react-query';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

export default function Account() {
    const { session } = useAuth();
    const authDispatcher = useDispatchAuth();
    const notificationDispatcher = useNotificationDispatch();

    // Query to delete a user avatar
    const deleteAvatarQuery = useDeleteUserUsernameAvatar();

    // Query to upload an avatar
    const uploadAvatarQuery = usePostResourceUploadUsername();

    const [uploadAvatar, setUploadAvatar] = useState<ContentState<PostResourceUploadUsername200, ApiErrorResponse>>({
        state: 'loading',
    });

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        try {
            const file = event.target.files[0];

            // If it's larger than 300 kilobytes...
            if (file.size > 1024 * 300) {
                setUploadAvatar({ state: 'error', error: { status: 'error', message: 'File is larger than 300Kb' } });
            } else {
                await uploadAvatarQuery.mutateAsync({ username: session.username, data: { file } });
            }
        } catch (e: unknown) {
            setUploadAvatar({ state: 'error', error: { status: 'error', message: "Couldn't read file." } });
        }
    };

    useEffect(() => {
        if (deleteAvatarQuery.isError && deleteAvatarQuery.error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't remove avatar." },
            });
        } else if (deleteAvatarQuery.data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully removed avatar.' },
            });

            // Essentially, we just want to remove the profile picture from the session
            authDispatcher({ type: 'data', data: { ...session, profilePictureUrl: undefined } });
        }
    }, [deleteAvatarQuery.isError, deleteAvatarQuery.isSuccess]);

    useEffect(() => {
        setUploadAvatar(transformMutationIntoContentState(uploadAvatarQuery));

        // dispatch update to get the user profile
        if (uploadAvatarQuery.isError && uploadAvatarQuery.error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: "Couldn't update avatar." },
            });
        } else if (uploadAvatarQuery.data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully updated avatar.' },
            });

            authDispatcher({ type: 'data', data: uploadAvatarQuery.data.user });
        }
    }, [uploadAvatarQuery.isError, uploadAvatarQuery.isSuccess]);

    return (
        <PageLayout sidebar={false}>
            <Box sx={{ p: 3, wordBreak: 'break-word' }}>
                <Typography variant={'h4'}>User Settings</Typography>
                <Divider />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                        <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                            User Avatar
                        </Typography>
                        <Typography variant={'body1'}>
                            You can change your avatar here or remove the current avatar.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <UserAvatar {...session} size={80} displayName={false} />
                            <Box sx={{ marginLeft: 2, flex: 1 }}>
                                <Typography variant={'h6'} sx={{ fontWeight: 'bold' }}>
                                    Upload new avatar
                                </Typography>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    id="upload-avatar"
                                    onChange={handleChange}
                                    accept={'image/jpeg, image/png'}
                                />
                                <Box component="label" htmlFor="upload-avatar">
                                    <LoadingButton
                                        loading={uploadAvatarQuery.isLoading}
                                        variant="outlined"
                                        sx={{ marginRight: 1 }}
                                        component="span"
                                    >
                                        Choose file...
                                    </LoadingButton>
                                    No file chosen.
                                </Box>
                                <Box sx={{ paddingBottom: 1 }}>
                                    <Typography variant={'caption'} sx={{ fontWeight: 'bold' }}>
                                        Maximum upload allowed is 300Kb.
                                    </Typography>
                                </Box>
                                <LoadingButton
                                    variant="outlined"
                                    loading={deleteAvatarQuery.isLoading}
                                    disabled={typeof session.profilePictureUrl === 'undefined'}
                                    onClick={() => deleteAvatarQuery.mutateAsync({ username: session.username })}
                                    size="small"
                                    color="error"
                                >
                                    Remove avatar
                                </LoadingButton>
                            </Box>
                        </Box>
                        {uploadAvatar.state === 'error' && <ErrorBanner message={uploadAvatar.error.message} />}
                        {deleteAvatarQuery.error && <ErrorBanner message={deleteAvatarQuery.error.message} />}
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
