import Box from '@mui/material/Box';
import { useAuth } from '../../../contexts/auth';
import { useLocation } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Void from './../../../static/images/void.svg';
import { ContentState } from '../../../types/requests';
import { ReactElement, useEffect, useState } from 'react';
import UploadAttachment from '../../../views/UploadAttachment';
import { ApiErrorResponse, ResourceResponseResponse } from '../../../lib/api/models';
import PublicationViewSource from '../../../components/PublicationSourceView';
import { transformQueryIntoContentState } from '../../../wrappers/react-query';
import { usePublicationState, usePublicationDispatch } from '../../../contexts/publication';
import { useGetPublicationUsernameNameTreePath as useGetPublicationSource } from '../../../lib/api/publications/publications';
import { computeUserOnPublicationPermission } from '../../../lib/utils/roles';

export default function Source(): ReactElement {
    const { session } = useAuth();
    const location = useLocation();
    const {
        publication: { name, owner, revision },
        publication,
    } = usePublicationState();
    const { refetch } = usePublicationDispatch();

    const [path, setPath] = useState<string>('');
    const [publicationSource, setPublicationSource] = useState<
        ContentState<ResourceResponseResponse, ApiErrorResponse>
    >({
        state: 'loading',
    });

    // Calculate the permissions of the current user in regards to the current publication
    const permission = computeUserOnPublicationPermission(publication, session);

    const getPublicationSourceQuery = useGetPublicationSource(owner.username, name, path, { revision });

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
    }, [getPublicationSourceQuery.data, getPublicationSourceQuery.error]);

    return (
        <Box>
            {publication.attachment ? (
                <PublicationViewSource
                    index={{ username: owner.username, name, revision }}
                    filename={path || '/'}
                    contents={publicationSource}
                />
            ) : permission.modify ? (
                <UploadAttachment
                    refetchData={() => {
                        refetch();
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
