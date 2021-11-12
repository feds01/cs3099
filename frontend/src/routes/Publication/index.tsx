import { useParams } from 'react-router';
import PageLayout from '../../components/PageLayout';
import { ContentState } from '../../types/requests';
import { ReactElement, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import { Tabs } from '@mui/material';
import Chip from '@mui/material/Chip';
import { formatDistance } from 'date-fns';
import Tab from '@mui/material/Tab';
import { Link } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import UserLink from '../../components/UserLink';
import Typography from '@mui/material/Typography';
import ErrorBanner from '../../components/ErrorBanner';
import SkeletonList from '../../components/SkeletonList';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { transformQueryIntoContentState } from '../../wrappers/react-query';

import { GetPublicationUsernameNameRevision200 as PublicationResponse } from '../../lib/api/models';
import { useGetPublicationUsernameNameRevision as useGetPublication } from '../../lib/api/publications/publications';

interface Props {}

interface PublicationParams {
    username: string;
    name: string;
    revision?: string;
    path?: string;
}

const TabMap = {
    '/': {
        label: 'Overview',
    },
    '/tree': {
        label: 'Source',
    },
    '/reviews': {
        label: 'Reviews',
    },
    '/settings': {
        label: 'Settings',
    },
};

function PublicationView() {
    const { username, name, revision }: PublicationParams = useParams();

    const [publicationInfo, setPublicationInfo] = useState<ContentState<PublicationResponse, any>>({
        state: 'loading',
    });

    // @@Cleanup: We could probably convert the revision into a query parameter instead of a path parameter
    // because the code generation that orval performs is so shit here!
    const getPublicationQuery = useGetPublication(username, name, revision || '');

    useEffect(() => {
        getPublicationQuery.refetch();
    }, [username, name, revision]);

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

            // TODO: Add a Tabs menu for publication introduction, sources, and (only if owner settings)

            return (
                <>
                    <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MarkdownRenderer fontSize={24} contents={publication.title} />
                            <Chip sx={{ ml: 1 }} label={publication.revision || 'current'} variant="outlined" />
                        </Box>
                        <Typography>
                            by <UserLink username={publication.owner.username} />{' '}
                            {formatDistance(publication.createdAt, new Date(), { addSuffix: true })}
                        </Typography>
                    </Box>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={location.pathname}>
                            {Object.entries(TabMap).map(([path, props]) => {
                                return <Tab key={path} component={Link} to={path} value={path} label={props.label} />;
                            })}
                        </Tabs>
                    </Box>
                </>
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
