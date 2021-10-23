import { useAuth } from '../../hooks/auth';
import { Container, Divider, Skeleton, Tab, Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { ReactElement, useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation, useParams } from 'react-router';
import PageLayout from '../../components/PageLayout';
import UserAvatar from '../../components/UserAvatar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { ContentState } from '../../types/requests';
import { User } from '../../lib/api/models';
import Overview from './Modules/Overview';
import Follows from './Modules/Follows';
import Reviews from './Modules/Reviews';
import Activity from './Modules/Activity';
import Publications from './Modules/Publications';
import { useGetUserId } from '../../lib/api/users/users';

interface Props {}

const TabMap = (username: string) => {
    return {
        [`/profile/${username}`]: {
            label: 'Overview',
            component: (id: string) => <Overview id={id} />,
        },
        [`/profile/${username}/activity`]: {
            label: 'Activity',
            component: (id: string) => <Activity title={'Most Recent Activity'} id={id} />,
        },
        [`/profile/${username}/publications`]: {
            label: 'Publications',
            component: (id: string) => <Publications id={id} />,
        },
        [`/profile/${username}/reviews`]: {
            label: 'Reviews',
            component: (id: string) => <Reviews id={id} />,
        },
        [`/profile/${username}/followers`]: {
            label: 'Followers',
            component: (id: string) => <Follows type="followers" id={id} />,
        },
        [`/profile/${username}/following`]: {
            label: 'Following',
            component: (id: string) => <Follows type="following" id={id} />,
        },
    };
};

interface IProfileLayout {
    content: ContentState<User, any>;
}

function ProfileLayout({ content }: IProfileLayout): ReactElement {
    switch (content.state) {
        case 'loading':
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                <UserAvatar {...profileData} size={80}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: 28 }} color="text" component="h1">
                        {profileData.username}
                    </Typography>
                    <Typography color="text" component="p">
                        Custom status?
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                        }}
                    >
                        <Typography>@{profileData.username}</Typography>
                        <Divider orientation="vertical" sx={{ margin: '0 4px' }} />
                        <Typography>Member since {Date.now()}</Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                        }}
                    >
                        <PersonOutlineIcon />
                        <Typography>
                            <Link to={`/profile/${profileData.username}/followers`}>{0} Followers</Link>
                        </Typography>
                        <Divider orientation="vertical" sx={{ margin: '0 4px' }} />
                        <Typography>
                            <Link to={`/profile/${profileData.username}/following`}>Following {0}</Link>
                        </Typography>
                    </Box>
                </UserAvatar>
            );
    }
}

export default function Profile(props: Props): ReactElement {
    const { session } = useAuth();
    const location = useLocation();

    // Get the user data
    const { id }: { id: string } = useParams();
    const content = useGetUserId(id);

    const [profileData, setProfileData] = useState<ContentState<User, any>>({ state: 'loading' });

    useEffect(() => {
        if (!content.isLoading) {
            if (content.isError) {
                setProfileData({ state: 'error', error: content.error });
            } else if (content.data) {
                setProfileData({ state: 'ok', data: content.data.user as User });
            }
        }
    }, [content.isLoading, content.isError, content.error]);

    return (
        <PageLayout title={'Profile'} sidebar={false}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    margin: 2,
                }}
            >
                <ProfileLayout content={profileData} />
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={location.pathname} centered>
                    {Object.entries(TabMap(session.username)).map(([path, props]) => {
                        return <Tab key={path} component={Link} to={path} value={path} label={props.label} />;
                    })}
                </Tabs>
            </Box>
            <Container
                sx={{
                    p: 2,
                    background: '#fff',
                    display: 'flex',
                    height: '100%',
                    flex: 1,
                }}
                color="text"
            >
                <Switch>
                    {Object.entries(TabMap(session.username)).map(([path, props]) => {
                        return (
                            <Route
                                exact
                                key={path}
                                path={path}
                                render={(routeProps) => <Box sx={{ width: '100%' }}>{props.component(session.id)}</Box>}
                            />
                        );
                    })}
                </Switch>
            </Container>
        </PageLayout>
    );
}
