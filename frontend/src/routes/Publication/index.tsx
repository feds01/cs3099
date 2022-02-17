import ErrorBanner from '../../components/ErrorBanner';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import PageLayout from '../../components/PageLayout';
import SkeletonList from '../../components/SkeletonList';
import UserLink from '../../components/UserLink';
import ExportDialog from '../../forms/ExportPublicationForm';
import { useAuth } from '../../hooks/auth';
import { PublicationProvider } from '../../hooks/publication';
import { GetPublicationUsernameName200 as PublicationResponse } from '../../lib/api/models';
import { useGetPublicationUsernameName as useGetPublication } from '../../lib/api/publications/publications';
import { computeUserPermission } from '../../lib/utils/roles';
import { ContentState } from '../../types/requests';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import Overview from './modules/Overview';
import Reviews from './modules/Reviews';
import Settings from './modules/Settings';
import Source from './modules/Source';
import { Alert, AlertTitle, Button, Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { formatDistance } from 'date-fns';
import { ReactElement, useEffect, useState } from 'react';
import { Route, Switch, useLocation, useParams } from 'react-router';
import { Link } from 'react-router-dom';

interface Props {}

interface PublicationParams {
    username: string;
    name: string;
    revision?: string;
    path?: string;
}

interface TabMapProps {
    viewSettings: boolean;
    isDraft: boolean;
}

const TabMap = ({ viewSettings, isDraft }: TabMapProps) => ({
    '/': {
        exact: true,
        strict: false,
        label: 'Overview',
        canonical: '',
        component: () => <Overview />,
    },
    '/tree/:path?': {
        exact: false,
        strict: false,
        label: 'Source',
        canonical: 'tree',
        component: () => <Source />,
    },
    ...(!isDraft && {
        '/reviews': {
            exact: false,
            strict: false,
            label: 'Reviews',
            canonical: 'reviews',
            component: () => <Reviews />,
        },
    }),
    ...(viewSettings && {
        '/settings': {
            exact: true,
            strict: true,
            label: 'Settings',
            canonical: 'settings',
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
    assert(typeof components[1] !== 'undefined');
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

    if (typeof tab === 'undefined') {
        if (revision.match(/^(|tree|reviews|settings)$/g)) {
            return [revision, ''];
        }

        return ['', revision];
    }

    if (tab.match(/^(|tree|reviews|settings)$/g)) {
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
            });

            // @@Bug: The export button and the title of the publication aren't aligned properly.
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
                                <MarkdownRenderer fontSize={24} contents={publication.title} />
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
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Typography>
                                by <UserLink user={publication.owner} />{' '}
                                {formatDistance(publication.createdAt, new Date(), { addSuffix: true })}
                            </Typography>
                            <Chip
                                size={'small'}
                                sx={{ ml: 1 }}
                                label={publication.revision || 'current'}
                                variant="outlined"
                            />
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
                                        label={props.label}
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

export default function PublicationRoute(props: Props): ReactElement {
    return (
        <PageLayout title={'Publication'}>
            <Container sx={{ p: 2 }}>
                <PublicationView />
            </Container>
        </PageLayout>
    );
}
