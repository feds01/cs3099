import FollowerButton from '../../components/FollowerButton';
import PageLayout from '../../components/PageLayout';
import UserAvatar from '../../components/UserAvatar';
import { User } from '../../lib/api/models';
import { useGetUserUsername } from '../../lib/api/users/users';
import { ContentState } from '../../types/requests';
import Activity from '../../views/Activity';
import Follows from '../../views/Follows';
import Overview from '../../views/Overview';
import Publications from '../../views/Publications';
import Reviews from '../../views/Reviews';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Divider, Skeleton, Tab, Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { ReactElement, useEffect, useState } from 'react';
import { Route, Switch, useLocation, useParams } from 'react-router';
import { Link } from 'react-router-dom';

const TabMap = (user: User) => {
    return {
        [`/profile/${user.username}`]: {
            label: 'Overview',
            component: (user: User) => <Overview user={user} />,
        },
        [`/profile/${user.username}/activity`]: {
            label: 'Activity',
            component: (user: User) => <Activity title={'Most Recent Activity'} username={user.username} />,
        },
        [`/profile/${user.username}/publications`]: {
            label: 'Publications',
            component: (user: User) => <Publications user={user} />,
        },
        [`/profile/${user.username}/reviews`]: {
            label: 'Reviews',
            component: (user: User) => <Reviews user={user} />,
        },
        [`/profile/${user.username}/followers`]: {
            label: 'Followers',
            component: (user: User) => <Follows type="followers" username={user.username} />,
        },
        [`/profile/${user.username}/following`]: {
            label: 'Following',
            component: (user: User) => <Follows type="following" username={user.username} />,
        },
    };
};

interface IProfileLayout {
    content: ContentState<ProfileData, any>;
}

function ProfileLayout({ content }: IProfileLayout): ReactElement {
    switch (content.state) {
        case 'loading':
            return (
                <Box sx={{ display: 'flex', pt: 2, flexDirection: 'column', alignItems: 'center' }}>
                    <Skeleton variant="circular" width={80} height={80} />
                    <Skeleton variant="text" width={120} height={28} />
                    <Skeleton variant="text" width={200} />
                    <Skeleton variant="text" width={200} />
                </Box>
            );
        case 'error':
            throw content.error;
        case 'ok':
            const profileData = content.data;
            return (
                <Box sx={{ pt: 2, width: '100%' }}>
                    <Box
                        sx={{
                            position: 'absolute',
                            zIndex: 1000,
                            pt: 2,
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                            display: 'flex',
                            flexDirection: 'row',
                            marginRight: 2,
                            width: '100%',
                        }}
                    >
                        <FollowerButton username={profileData.user.username} />
                    </Box>
                    <UserAvatar {...profileData.user} size={80}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 28 }} color="text" component="h1">
                            {profileData.user.name}
                        </Typography>
                        {profileData.user.status && (
                            <Typography color="text" component="p">
                                {profileData.user.status}
                            </Typography>
                        )}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            <Typography>@{profileData.user.username}</Typography>
                            <span style={{ margin: '0 4px' }}>&bull;</span>
                            <Typography>Member since {format(profileData.user.createdAt, 'dd MMM yyyy')}</Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            <PersonOutlineIcon />
                            <Typography>
                                <Link to={`/profile/${profileData.user.username}/followers`}>
                                    {profileData.follows.followers}{' '}
                                    {profileData.follows.followers === 1 ? 'Follower' : 'Followers'}
                                </Link>
                            </Typography>
                            <Divider orientation="vertical" flexItem sx={{ m: '0 4px' }} />
                            <Typography>
                                <Link to={`/profile/${profileData.user.username}/following`}>
                                    Following {profileData.follows.following}
                                </Link>
                            </Typography>
                        </Box>
                    </UserAvatar>
                </Box>
            );
    }
}

type ProfileData = { user: User; follows: { followers: number; following: number } };

export default function ProfilePage(): ReactElement {
    const location = useLocation();

    // Get the user data
    const { id }: { id: string } = useParams();
    const content = useGetUserUsername(id);

    const [profileData, setProfileData] = useState<ContentState<ProfileData, any>>({ state: 'loading' });

    useEffect(() => {
        if (!content.isLoading) {
            if (content.isError) {
                setProfileData({ state: 'error', error: content.error });
            } else if (content.data) {
                setProfileData({ state: 'ok', data: { user: content.data.user, follows: content.data.follows } });
            }
        }
    }, [content.data]);

    return (
        <PageLayout title={'Profile'} sidebar={false}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: 2,
                }}
            >
                <ProfileLayout content={profileData} />
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={location.pathname} centered>
                    {profileData.state === 'ok' &&
                        Object.entries(TabMap(profileData.data.user)).map(([path, props]) => {
                            return <Tab key={path} component={Link} to={path} value={path} label={props.label} />;
                        })}
                </Tabs>
            </Box>
            <Box
                sx={{
                    p: 2,
                    background: '#fff',
                    display: 'flex',
                    flex: 1,
                    flexShrink: 0,
                }}
                color="text"
            >
                <Switch>
                    {profileData.state === 'ok' && (
                        <>
                            {Object.entries(TabMap(profileData.data.user)).map(([path, props]) => {
                                return (
                                    <Route
                                        exact
                                        key={path}
                                        path={path}
                                        render={() => (
                                            <Box sx={{ width: '100%', alignSelf: 'stretch' }}>
                                                {props.component(profileData.data.user)}
                                            </Box>
                                        )}
                                    />
                                );
                            })}
                        </>
                    )}
                </Switch>
            </Box>
        </PageLayout>
    );
}
