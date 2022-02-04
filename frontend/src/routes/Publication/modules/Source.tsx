import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import UploadAttachment from '../../../views/UploadAttachment';
import { ReactElement, useEffect, useState } from 'react';
import PublicationViewSource from '../../../components/PublicationSourceView';
import { Publication, ResourceResponseResponse } from '../../../lib/api/models';
import { transformQueryIntoContentState } from '../../../wrappers/react-query';

import { useGetPublicationUsernameNameRevisionTreePath as useGetPublicationSource } from '../../../lib/api/publications/publications';
import { useAuth } from '../../../hooks/auth';
import { ContentState } from '../../../types/requests';
import Void from './../../../static/images/void.svg';
import { usePublicationDispatch, usePublicationState } from '../../../hooks/publication';

export default function Source(): ReactElement {
    const { session } = useAuth();
    const location = useLocation();
    const { publication: {name, owner, revision}, publication } = usePublicationState();
    const { refetch } = usePublicationDispatch();

    const [path, setPath] = useState<string>('');
    const [publicationSource, setPublicationSource] = useState<ContentState<ResourceResponseResponse, any>>({
        state: 'loading',
    });

    const getPublicationSourceQuery = useGetPublicationSource(owner.username, name, revision, path);

    // We need to update the path if it changes...
    useEffect(() => {
        const components = location.pathname.split('/tree');
        const newPath = components[components.length - 1];

        if (newPath.startsWith('/')) {
            setPath(newPath.slice(1, newPath.length));
        } else {
            setPath(newPath);
        }

    }, [location.pathname]);

    useEffect(() => {
        getPublicationSourceQuery.refetch();
    }, [owner.username, name, path]);

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
                <UploadAttachment
                    refetchData={() => {
                        refetch();

                        if (!publication.attachment) return;
                        getPublicationSourceQuery.refetch();
                    }}
                    publication={publication}
                />
            ) : (
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <img src={Void} height={128} width={128} alt="void" />
                    <Typography variant={'body1'}>This publication doesn't have any sources yet.</Typography>
                </Box>
            )}
        </Box>
    );
}
