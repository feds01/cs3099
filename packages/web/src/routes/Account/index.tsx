import ErrorBanner from '../../components/ErrorBanner';
import PageLayout from '../../components/PageLayout';
import UserAvatar from '../../components/UserAvatar';
import { useAuth, useDispatchAuth } from '../../contexts/auth';
import { useNotificationDispatch } from '../../contexts/notification';
import DeleteUserAccountForm from '../../forms/DeleteUserAccountForm';
import { AccountUpdateForm } from '../../forms/UpdateAccountForm';
import UpdateAccountRoleForm from '../../forms/UpdateAccountRoleForm';
import { ApiErrorResponse, GetUserUsername200, User } from '../../lib/api/models';
import { PostResourceUploadUsername200 } from '../../lib/api/models/postResourceUploadUsername200';
import { usePostResourceUploadUsername } from '../../lib/api/resources/resources';
import { useDeleteUserUsernameAvatar, useGetUserUsername } from '../../lib/api/users/users';
import { computeUserPermission } from '../../lib/utils/roles';
import { ContentState } from '../../types/requests';
import { transformMutationIntoContentState, transformQueryIntoContentState } from '../../wrappers/react-query';
import LoadingButton from '@mui/lab/LoadingButton';
import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export default function Account() {
    const { session } = useAuth();
    const authDispatcher = useDispatchAuth();
    const notificationDispatcher = useNotificationDispatch();

    const { username } = useParams<{ username?: string }>();
    const getUserQuery = useGetUserUsername(username ?? session.username);
    const isSelf = username ? username === session.username : true;

    const [userQueryResponse, setUserQueryResponse] = useState<ContentState<GetUserUsername200, ApiErrorResponse>>({
        state: 'loading',
    });

    useEffect(() => {
        const result = transformQueryIntoContentState(getUserQuery);
        setUserQueryResponse(result);

        // We want to dispatch state update....
        if (result.state === 'ok' && isSelf) {
            authDispatcher({ type: 'data', data: { ...result.data.user } });
        }
    }, [getUserQuery.data, getUserQuery.error]);

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
            } else if (userQueryResponse.state === 'ok') {
                await uploadAvatarQuery.mutateAsync({ username: userQueryResponse.data.user.username, data: { file } });
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

            if (isSelf) {
                authDispatcher({ type: 'data', data: { ...session, profilePictureUrl: undefined } });
            }
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

            if (isSelf) {
                authDispatcher({ type: 'data', data: uploadAvatarQuery.data.user });
            }
        }
    }, [uploadAvatarQuery.isError, uploadAvatarQuery.isSuccess]);

    const renderContent = (user: User) => {
        const permissions = computeUserPermission(user.id, session);

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
                                <UserAvatar {...user} size={80} displayName={false} />
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
                                        disabled={typeof user.profilePictureUrl === 'undefined'}
                                        onClick={() => deleteAvatarQuery.mutateAsync({ username: user.username })}
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
                        <Grid item xs={12}>
                            <AccountUpdateForm refetch={getUserQuery.refetch} user={user} isSelf={isSelf} />
                        </Grid>
                        {permissions.delete && (
                            <Grid item xs={12}>
                                <Grid
                                    container
                                    spacing={2}
                                    sx={{ borderTop: '1px solid', borderColor: 'divider', pb: 2 }}
                                >
                                    <Grid item xs={12} md={5}>
                                        <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                                            Delete Account
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={7}>
                                        <Typography variant={'h6'}>
                                            Deleting an account has certain effects on{' '}
                                            {typeof username === 'undefined' ? 'your' : 'the users'} data:
                                        </Typography>
                                        <Box component="ul" sx={{ pt: 1, paddingInlineStart: '40px' }}>
                                            <li>
                                                <Typography variant={'body1'}>
                                                    Some content that{' '}
                                                    {typeof username === 'undefined'
                                                        ? 'you post'
                                                        : 'is posted by the user'}{' '}
                                                    on the platform might persist and is inherited by a system user to
                                                    preserve data consistency.
                                                </Typography>
                                            </li>
                                            <li>
                                                <Typography variant={'body1'}>
                                                    All of {typeof username === 'undefined' ? 'your' : 'the users'}{' '}
                                                    reviews, publications, and comments might be deleted when performing
                                                    this action.
                                                </Typography>
                                            </li>
                                        </Box>
                                        <DeleteUserAccountForm username={user.username} isSelf={isSelf} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                        {session.role !== 'default' && (
                            <Grid item xs={12}>
                                <Grid
                                    container
                                    spacing={2}
                                    sx={{ borderTop: '1px solid', borderColor: 'divider', pb: 2 }}
                                >
                                    <Grid item xs={12} md={5}>
                                        <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                                            Account Role
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <Typography variant={'h6'}>
                                            Updating an account role changes what permissions the account has in the
                                            following ways:
                                        </Typography>
                                        <Box component="ul" sx={{ pt: 1, paddingInlineStart: '40px', pb: 1 }}>
                                            <li>
                                                <Typography variant={'body1'}>
                                                    If the account is marked as a{' '}
                                                    <span style={{ fontWeight: 'bold' }}>Administrator</span>, then the
                                                    account has permissions to perform any kind of action.
                                                </Typography>
                                            </li>
                                            <li>
                                                <Typography variant={'body1'}>
                                                    If the account is marked as a{' '}
                                                    <span style={{ fontWeight: 'bold' }}>Moderator</span>, then the
                                                    account has permissions to view potentially hidden content and
                                                    update resources that don't necessarily belong to the user account.
                                                </Typography>
                                            </li>
                                        </Box>
                                        <UpdateAccountRoleForm user={user} refetch={getUserQuery.refetch} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </PageLayout>
        );
    };

    switch (userQueryResponse.state) {
        case 'loading':
            return (
                <PageLayout sidebar={false}>
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={'small'} />
                    </Box>
                </PageLayout>
            );
        case 'error':
            return (
                <PageLayout>
                    <ErrorBanner message={userQueryResponse.error.message} />
                </PageLayout>
            );
        case 'ok':
            return renderContent(userQueryResponse.data.user);
    }
}
