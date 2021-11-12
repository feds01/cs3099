import { useParams } from 'react-router';
import PageLayout from '../../components/PageLayout';
import { ContentState } from '../../types/requests';
import { ReactElement, useEffect, useState } from 'react';
import Void from './../../static/images/void.svg';

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
import UserLink from '../../components/UserLink';
import Typography from '@mui/material/Typography';
import { formatDistance } from 'date-fns';
import UploadAttachment from '../../views/UploadAttachment';
import { useAuth } from '../../hooks/auth';

interface Props {}

interface PublicationParams {
    username: string;
    name: string;
    revision?: string;
    path?: string;
}

function PublicationView() {
    const { session } = useAuth();
    const { username, name, revision, path }: PublicationParams = useParams();

    const [publicationInfo, setPublicationInfo] = useState<ContentState<PublicationResponse, any>>({
        state: 'loading',
    });
    const [publicationSource, setPublicationSource] = useState<ContentState<ResourceResponseResponse, any>>({
        state: 'loading',
    });

    // @@Cleanup: We could probably convert the revision into a query parameter instead of a path parameter
    // because the code generation that orval performs is so shit here!
    const getPublicationQuery = useGetPublication(username, name, revision || '');
    const getPublicationSourceQuery = useGetPublicationSource(username, name, revision || '', path || '');
    const getMainPublicationSourceQuery = useGetRevisionlessPublicationSource(username, name, path || '');

    const refetchSources = () => {
        if (publicationInfo.state === 'ok') {
            const { attachment } = publicationInfo.data.publication;
            if (!attachment) return;

            if (typeof revision !== 'undefined') {
                getPublicationSourceQuery.refetch();
            } else {
                getMainPublicationSourceQuery.refetch();
            }
        }
    }

    useEffect(() => {
        getPublicationQuery.refetch();
    }, [username, name, revision]);

    useEffect(() => refetchSources(), [username, publicationInfo.state, name, revision, path]);

    useEffect(() => {
        setPublicationInfo(transformQueryIntoContentState(getPublicationQuery));
    }, [getPublicationQuery.data, getPublicationQuery.isLoading]);

    useEffect(() => {
        if (typeof revision !== 'undefined') {
            setPublicationSource(transformQueryIntoContentState(getPublicationSourceQuery));
        } else {
            setPublicationSource(transformQueryIntoContentState(getMainPublicationSourceQuery));
        }
    }, [getPublicationSourceQuery.isLoading, getMainPublicationSourceQuery.isLoading]);

    switch (publicationInfo.state) {
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
            return <ErrorBanner message={publicationInfo.error?.message} />;
        }
        case 'ok': {
            const { publication } = publicationInfo.data;
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
                    {publication.introduction && <MarkdownRenderer contents={publication.introduction} />}
                    <Divider />
                    {publication.attachment ? (
                        <PublicationViewSource
                            index={{ username, name, revision }}
                            filename={path || '/'}
                            contents={publicationSource}
                        />
                    ) : publication.owner.id === session.id ? (
                        <UploadAttachment refetchData={refetchSources} publication={publication} />
                    ) : (
                        <Box sx={{ m: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <img src={Void} height={128} width={128} alt="void" />
                            <Typography variant={'body1'}>This publication doesn't have any sources yet.</Typography>
                        </Box>
                    )}
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
