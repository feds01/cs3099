import ErrorBanner from '../../components/ErrorBanner';
import PageLayout from '../../components/PageLayout';
import SkeletonList from '../../components/SkeletonList';
import UserAvatar from '../../components/UserAvatar';
import UserLink from '../../components/UserLink';
import ExportDialog from '../../forms/ExportPublicationForm';
import { useAuth } from '../../contexts/auth';
import { PublicationProvider } from '../../contexts/publication';
import { GetPublicationUsernameName200 as PublicationResponse } from '../../lib/api/models';
import { useGetPublicationUsernameName as useGetPublication } from '../../lib/api/publications/publications';
import { computeUserPermission } from '../../lib/utils/roles';
import { ContentState } from '../../types/requests';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import Collaborators from './modules/Collaborators';
import Overview from './modules/Overview';
import Reviews from './modules/Reviews';
import Revisions from './modules/Revisions';
import Settings from './modules/Settings';
import Source from './modules/Source';
import { Alert, AlertTitle, AvatarGroup, Button, Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { formatDistance } from 'date-fns';
import { ReactElement, useEffect, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { MdOutlineEdit, MdDescription, MdOutlineSettings, MdCode, MdReviews } from 'react-icons/md';
import { Route, Switch, useLocation, useParams } from 'react-router';
import { Link } from 'react-router-dom';

interface PublicationParams {
    username: string;
    name: string;
    revision?: string;
    path?: string;
}

interface TabMapProps {
    viewSettings: boolean;
    isDraft: boolean;
    reviewCount: number;
    collaboratorCount: number;
}

interface TabProps {
    exact: boolean;
    strict: boolean;
    label: string | React.ReactElement;
    canonical: string;
    icon?: React.ReactElement;
    component: () => React.ReactNode;
}

const TabMap = ({ viewSettings, reviewCount, collaboratorCount, isDraft }: TabMapProps): Record<string, TabProps> => ({
    '/': {
        exact: true,
        strict: false,
        label: 'Overview',
        canonical: '',
        icon: <MdDescription size={16} />,
        component: () => <Overview />,
    },
    ...(collaboratorCount > 0 && {
        '/collaborators': {
            exact: true,
            strict: false,
            label: (
                <>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Collaborators
                    </Typography>
                    <Chip size="small" sx={{ ml: 0.5 }} label={collaboratorCount} />
                </>
            ),
            canonical: 'collaborators',
            icon: <FiUsers size={16} />,
            component: () => <Collaborators />,
        },
    }),
    '/tree/:path?': {
        exact: false,
        strict: false,
        label: 'Source',
        canonical: 'tree',
        icon: <MdCode size={16} />,
        component: () => <Source />,
    },
    '/revisions': {
        exact: true,
        strict: false,
        label: 'Revisions',
        canonical: 'revisions',
        icon: <MdOutlineEdit size={16} />,
        component: () => <Revisions />,
    },
    ...(!isDraft && {
        '/reviews': {
            exact: false,
            strict: false,
            label: (
                <>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Reviews
                    </Typography>
                    {reviewCount > 0 && <Chip size="small" sx={{ ml: 0.5 }} label={reviewCount} />}
                </>
            ),
            canonical: 'reviews',
            icon: <MdReviews size={16} />,
            component: () => <Reviews />,
        },
    }),
    ...(viewSettings && {
        '/settings': {
            exact: true,
            strict: true,
            label: 'Settings',
            canonical: 'settings',
            icon: <MdOutlineSettings size={16} />,
            component: () => <Settings />,
        },
    }),
});

/**
 * Get a canonical name from the current location when looking at a repository.
 *
 * @param location - The pathname of the location
 */
function getCanonicalName(location: string, username: string, name: string): [string, string] {
    // essentially we want to split by the first `/username/name` chunk.
    const components = location.split(`/${username}/${name}`);

    if (typeof components[1] === 'undefined') {
        throw new Error('Invalid path in canonical name');
    }

    const component = components[1];

    // Now check if the current path has a revision, we also have to account
    // that revisions can be defined with the same canonical name as the actual
    // tab name, so essentially we check if there any matches for `${canonical}/${canonical}`.
    // If this is the case, we can consider the first part as being the revision, and
    // the other part as being the tab to use.
    const [revision, tab] = component.split('/').filter((x) => x !== '');

    // The root
    if (typeof tab === 'undefined' && typeof revision === 'undefined') {
        return ['', ''];
    }

    // This regex matches on tabs instead of revisions...
    const absoluteTabRegex = /^(|tree|reviews|revisions|collaborators|settings)$/g;

    if (typeof tab === 'undefined') {
        if (revision.match(absoluteTabRegex)) {
            return [revision, ''];
        }

        return ['', revision];
    }

    if (tab.match(absoluteTabRegex)) {
        return [tab, revision];
    }

    return [revision, ''];
}

function PublicationView() {
    const location = useLocation();
    const { session } = useAuth();
    const { username, name }: PublicationParams = useParams();

    const [canonicalName, setCanonicalName] = useState<[string, string]>(
        getCanonicalName(location.pathname, username, name),
    );

    const [publicationInfo, setPublicationInfo] = useState<ContentState<PublicationResponse, any>>({
        state: 'loading',
    });

    const getPublicationQuery = useGetPublication(username, name, {
        ...(canonicalName[1] !== '' && { revision: canonicalName[1] }),
    });

    //setting constants for the export dialog
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    useEffect(() => {
        setCanonicalName(getCanonicalName(location.pathname, username, name));
    }, [location.pathname]);

    useEffect(() => {
        getPublicationQuery.refetch();
    }, [username, name, canonicalName[1]]);

    useEffect(() => {
        setPublicationInfo(transformQueryIntoContentState(getPublicationQuery));
    }, [getPublicationQuery.data, getPublicationQuery.isLoading]);

    switch (publicationInfo.state) {
        case 'loading': {
            return (
                <Box sx={{ mb: 1 }}>
                    <Skeleton variant="text" width={120} height={28} />
                    <Skeleton variant="text" width={200} />
                    <Divider />
                    <SkeletonList rows={4} />
                </Box>
            );
        }
        case 'error': {
            return <ErrorBanner message={publicationInfo.error?.message} />;
        }
        case 'ok': {
            const { publication } = publicationInfo.data;
            const basename = `/${username}/${name}` + (canonicalName[1] !== '' ? `/${canonicalName[1]}` : '');

            // Calculate the permissions of the current user in regards to the current publication
            const permission = computeUserPermission(publication.owner.id, session);

            const tabMap = TabMap({
                viewSettings: permission.modify,
                isDraft: publication.draft,
                reviewCount: publication.reviews,
                collaboratorCount: publication.collaborators.length,
            });

            return (
                <PublicationProvider state={{ publication, permission }} refetch={getPublicationQuery.refetch}>
                    {publication.draft && (
                        <Alert severity="warning">
                            <AlertTitle>Warning</AlertTitle>
                            This publication isn't visible until you upload sources to it
                        </Alert>
                    )}
                    <Box sx={{ mb: 1, pt: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Typography sx={{ fontWeight: 'bold' }} variant="h4">
                                    {publication.title}
                                </Typography>
                            </Box>
                            <Box>
                                <Button onClick={() => setExportDialogOpen(true)}>Export</Button>
                                <ExportDialog
                                    username={username}
                                    name={name}
                                    revision={publication.revision}
                                    open={exportDialogOpen}
                                    onClose={() => setExportDialogOpen(false)}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', lineHeight: '28px' }}>
                            <Typography sx={{ lineHeight: '28px !important' }}>by </Typography>
                            <Box sx={{ display: 'inline-flex', ml: 0.5, mr: 0.5 }}>
                                <UserAvatar size={24} {...publication.owner} />
                            </Box>
                            <Typography sx={{ lineHeight: '28px !important' }}>
                                <UserLink user={publication.owner} />
                                {publication.collaborators.length === 0 && <>&nbsp;</>}
                            </Typography>
                            {publication.collaborators.length > 0 && (
                                <Box sx={{ display: 'inline-flex' }}>
                                    <Typography sx={{ lineHeight: '28px !important' }}>&nbsp;{'and '}</Typography>
                                    <AvatarGroup max={6} sx={{ ml: 0.5, mr: 0.5 }}>
                                        {publication.collaborators.map((collaborator) => {
                                            return <UserAvatar size={24} key={collaborator.id} {...collaborator} />;
                                        })}
                                    </AvatarGroup>
                                </Box>
                            )}
                            <Typography sx={{ lineHeight: '28px !important' }}>
                                {formatDistance(publication.createdAt, new Date(), { addSuffix: true })}
                            </Typography>
                            <Chip size={'small'} sx={{ ml: 1 }} label={publication.revision} variant="outlined" />
                        </Box>
                    </Box>
                    <Box sx={{ borderBottom: 1, mb: 2, borderColor: 'divider' }}>
                        <Tabs value={canonicalName[0]}>
                            {Object.entries(tabMap).map(([path, props]) => {
                                return (
                                    <Tab
                                        key={path}
                                        component={Link}
                                        to={`${basename}/${props.canonical}`}
                                        value={props.canonical}
                                        {...(typeof props.icon !== 'undefined' && {
                                            icon: props.icon,
                                            iconPosition: 'start',
                                        })}
                                        sx={{
                                            height: '48px !important',
                                            minHeight: '48px',
                                            '&:hover': {
                                                color: (t) => t.palette.primary.main,
                                            },
                                        }}
                                        label={
                                            typeof props.label === 'string' ? (
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {props.label}
                                                </Typography>
                                            ) : (
                                                props.label
                                            )
                                        }
                                    />
                                );
                            })}
                        </Tabs>
                    </Box>
                    <Switch>
                        <>
                            {Object.entries(tabMap).map(([path, props]) => {
                                return (
                                    <Route
                                        exact={props.exact}
                                        strict={props.strict}
                                        key={path}
                                        path={`${basename}${path}`}
                                        render={(routeProps) => {
                                            return (
                                                <Box sx={{ pt: 2, width: '100%', alignSelf: 'stretch' }}>
                                                    {props.component()}
                                                </Box>
                                            );
                                        }}
                                    />
                                );
                            })}
                        </>
                    </Switch>
                </PublicationProvider>
            );
        }
    }
}

export default function PublicationRoute(): ReactElement {
    return (
        <PageLayout>
            <Container sx={{ p: 2 }}>
                <PublicationView />
            </Container>
        </PageLayout>
    );
}
