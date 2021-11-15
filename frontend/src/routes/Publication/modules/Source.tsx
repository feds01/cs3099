import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import UploadAttachment from '../../../views/UploadAttachment';
import React, { ReactElement, useEffect, useState } from 'react';
import PublicationViewSource from '../../../components/PublicationSourceView';
import { Publication, ResourceResponseResponse } from '../../../lib/api/models';
import { transformQueryIntoContentState } from '../../../wrappers/react-query';

import { useGetPublicationUsernameNameRevisionTreePath as useGetPublicationSource } from '../../../lib/api/publications/publications';
import { useAuth } from '../../../hooks/auth';
import { ContentState } from '../../../types/requests';
import Void from './../../../static/images/void.svg';

interface Props {
    publication: Publication;
    refetchPublication: () => void;
}

export default function Source({ refetchPublication, publication }: Props): ReactElement {
    const { session } = useAuth();
    const { name, owner, revision } = publication;

    const [publicationSource, setPublicationSource] = useState<ContentState<ResourceResponseResponse, any>>({
        state: 'loading',
    });

    const path = '';

    const getPublicationSourceQuery = useGetPublicationSource(owner.username, name, revision, path);

    const refetchSources = () => {
        refetchPublication();

        if (!publication.attachment) return;
        getPublicationSourceQuery.refetch();
    };

    useEffect(() => refetchSources(), [owner.username, name, path]);

    useEffect(() => {
        setPublicationSource(transformQueryIntoContentState(getPublicationSourceQuery));
    }, [getPublicationSourceQuery.data]);

    return (
        <Box>
            {publication.attachment ? (
                <PublicationViewSource
                    index={{ username: owner.username, name, revision }}
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
