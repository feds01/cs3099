import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import UploadAttachment from '../../../views/UploadAttachment';
import React, { ReactElement, useEffect, useState } from 'react';
import PublicationViewSource from '../../../components/PublicationSourceView';
import { Publication, ResourceResponseResponse } from '../../../lib/api/models';
import { transformQueryIntoContentState } from '../../../wrappers/react-query';

import {
    useGetPublicationUsernameNameRevisionTreePath as useGetPublicationSource,
    useGetPublicationUsernameNameTreePath as useGetRevisionlessPublicationSource,
} from '../../../lib/api/publications/publications';
import { useAuth } from '../../../hooks/auth';
import { ContentState } from '../../../types/requests';
import Void from './../../../static/images/void.svg';

interface Props {
    username: string;
    publication: Publication;
    refetchPublication: () => void;
}

interface PublicationParams {
    username: string;
    name: string;
    revision?: string;
    path?: string;
}

export default function Source({ username, refetchPublication, publication }: Props): ReactElement {
    const { session } = useAuth();
    const { name, owner } = publication;
    const { path, revision } = useParams<PublicationParams>();

    const [publicationSource, setPublicationSource] = useState<ContentState<ResourceResponseResponse, any>>({
        state: 'loading',
    });

    const getPublicationSourceQuery = useGetPublicationSource(username, name, revision || '', path || '');
    const getMainPublicationSourceQuery = useGetRevisionlessPublicationSource(username, name, path || '');

    const refetchSources = () => {
        refetchPublication();

        if (!publication.attachment) return;

        if (typeof revision !== 'undefined') {
            getPublicationSourceQuery.refetch();
        } else {
            getMainPublicationSourceQuery.refetch();
        }
    };

    useEffect(() => refetchSources(), [username, name, revision, path]);

    useEffect(() => {
        if (typeof revision !== 'undefined') {
            setPublicationSource(transformQueryIntoContentState(getPublicationSourceQuery));
        } else {
            setPublicationSource(transformQueryIntoContentState(getMainPublicationSourceQuery));
        }
    }, [getPublicationSourceQuery.data, getMainPublicationSourceQuery.data]);

    return (
        <Box>
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
        </Box>
    );
}
