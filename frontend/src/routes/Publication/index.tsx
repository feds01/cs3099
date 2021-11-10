import { useParams } from 'react-router';
import PageLayout from '../../components/PageLayout';
import { ContentState } from '../../types/requests';
import { ReactElement, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import PublicationViewSource from '../../components/PublicationSourceView';
import { transformQueryIntoContentState } from '../../wrappers/react-query';

import {
    GetPublicationUsernameNameRevision200 as PublicationResponse,
    ResourceResponseResponse,
} from '../../lib/api/models';
import {
    useGetPublicationUsernameNameRevision as useGetPublication,
    useGetPublicationUsernameNameRevisionTreePath as useGetPublicationSource,
    useGetPublicationUsernameNameTreePath as useGetRevisionlessPublicationSource,
} from '../../lib/api/publications/publications';
import ErrorBanner from '../../components/ErrorBanner';

interface Props {}

interface PublicationParams {
    username: string;
    name: string;
    revision?: string;
    path?: string;
}

function PublicationView() {
    const { username, name, revision, path }: PublicationParams = useParams();

    const [publication, setPublication] = useState<ContentState<PublicationResponse, any>>({ state: 'loading' });
    const [publicationSource, setPublicationSource] = useState<ContentState<ResourceResponseResponse, any>>({
        state: 'loading',
    });

    // @@Cleanup: We could probably convert the revision into a query parameter instead of a path parameter
    // because the code generation that orval performs is so shit here!
    const getPublicationQuery = useGetPublication(username, name, revision || '');
    const getPublicationSourceQuery = useGetPublicationSource(username, name, revision || '', path || '');
    const getMainPublicationSourceQuery = useGetRevisionlessPublicationSource(username, name, path || '');

    useEffect(() => {
        getPublicationQuery.refetch();
    }, [username, name, revision]);

    useEffect(() => {
        if (typeof revision !== 'undefined') {
            getPublicationSourceQuery.refetch();
        } else {
            getMainPublicationSourceQuery.refetch();
        }
    }, [username, name, revision, path]);

    useEffect(() => {
        setPublication(transformQueryIntoContentState(getPublicationQuery));
    }, [getPublicationQuery.data, getPublicationQuery.isLoading]);

    useEffect(() => {
        if (typeof revision !== 'undefined') {
            setPublicationSource(transformQueryIntoContentState(getPublicationSourceQuery));
        } else {
            setPublicationSource(transformQueryIntoContentState(getMainPublicationSourceQuery));
        }
    }, [getPublicationSourceQuery.isLoading, getMainPublicationSourceQuery.isLoading]);

    switch (publication.state) {
        case 'loading': {
            return (
                <div>
                    {username}/{name}/{revision ?? 'current'}
                    <br />
                    Access file: {path ?? '/'}
                </div>
            );
        }
        case 'error': {
            return <ErrorBanner message={publication.error?.message} />;
        }
        case 'ok': {
            return (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MarkdownRenderer contents={publication.data.publication.title} />
                        <Chip
                            sx={{ ml: 1 }}
                            label={publication.data.publication.revision || 'current'}
                            variant="outlined"
                        />
                    </Box>
                    {publication.data.publication.introduction && (
                        <MarkdownRenderer contents={publication.data.publication.introduction} />
                    )}
                    <Divider />
                    <PublicationViewSource
                        index={{ username, name, revision }}
                        filename={path || '/'}
                        contents={publicationSource}
                    />
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
