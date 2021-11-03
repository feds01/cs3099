import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PageLayout from '../../components/PageLayout';
import { ContentState } from '../../types/requests';
import {
    GetPublicationUsernameNameRevision200 as PublicationResponse,
    ResourceResponseResponse,
} from '../../lib/api/models';
import {
    useGetPublicationUsernameNameRevision as useGetPublication,
    useGetPublicationUsernameNameRevisionTreePath as useGetPublicationSource,
    useGetPublicationUsernameNameTreePath as useGetRevisionlessPublicationSource,
} from '../../lib/api/publications/publications';
import PublicationViewSource from '../../components/PublicationSourceView';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

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
    const getPublicationSourceQuery = useGetPublicationSource(username, name, revision || '', path || '/');
    const getMainPublicationSourceQuery = useGetRevisionlessPublicationSource(username, name, path || '/');

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
            return (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    Failed to fetch resource: <strong>{publication.error?.message}</strong>
                </Alert>
            );
        }
        case 'ok': {
            return (
                <PublicationViewSource
                    username={username}
                    name={name}
                    revision={revision}
                    filename={path || '/'}
                    contents={publicationSource}
                />
            );
        }
    }
}

export default function PublicationRoute(props: Props): ReactElement {
    return (
        <PageLayout title={'Publication'}>
            <Container>
                <PublicationView />
            </Container>
        </PageLayout>
    );
}
