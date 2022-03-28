import ErrorBanner from '../../../../components/ErrorBanner';
import { useReviewState } from '../../../../contexts/review';
import { ApiErrorResponse, GetPublicationUsernameNameSources200 } from '../../../../lib/api/models';
import { useGetPublicationUsernameNameSources } from '../../../../lib/api/publications/publications';
import { ContentState } from '../../../../types/requests';
import { transformQueryIntoContentState } from '../../../../wrappers/react-query';
import SourceList from './SourceList';
import TreeView from './TreeView';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { ReactElement, useEffect, useState } from 'react';

export default function ReviewEditor(): ReactElement {
    const {
        review: { publication, status },
    } = useReviewState();

    const fileQuery = useGetPublicationUsernameNameSources(publication.owner.username, publication.name, {
        revision: publication.revision,
    });

    const [resourceResponse, setResourceResponse] = useState<
        ContentState<GetPublicationUsernameNameSources200, ApiErrorResponse>
    >({
        state: 'loading',
    });

    useEffect(() => {
        setResourceResponse(transformQueryIntoContentState(fileQuery));
    }, [fileQuery.data, fileQuery.isLoading]);

    switch (resourceResponse.state) {
        case 'loading': {
            return <LinearProgress />;
        }
        case 'error': {
            return <ErrorBanner message={resourceResponse.error.message} />;
        }
        case 'ok': {
            const { entries } = resourceResponse.data;
            return (
                <Box
                    sx={{
                        display: 'flex',
                        minWidth: 800,
                        flexDirection: 'row',
                        minHeight: '100%',
                        overflowX: 'hidden',
                        width: 'calc(100vw - 41px)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '30%',
                            maxWidth: 300,
                            position: 'fixed',
                            height: '100%',
                            borderRight: 1,
                            flex: 1,
                            zIndex: 80,
                            borderColor: 'divider',
                            overflowY: 'scroll',
                            overflowX: 'scroll',
                        }}
                    >
                        <TreeView paths={entries.map((entry) => entry.filename)} />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            pl: 'min(30%, 300px)',
                            position: 'relative',
                            width: 'calc(100% - min(30%, 300px))',
                            flexDirection: 'column',
                            flex: 1,
                            overflowY: 'scroll',
                            overflowX: 'hidden',
                            mr: 1,
                            ml: 1,
                            ...(status === 'started' && { pb: '60px' }),
                        }}
                    >
                        <SourceList entries={entries} />
                    </Box>
                </Box>
            );
        }
    }
}
