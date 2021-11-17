import TreeView from '../TreeView';
import Box from '@mui/material/Box';
import ErrorBanner from '../ErrorBanner';
import CodeRenderer from '../CodeRenderer';
import { ContentState } from '../../types/requests';
import LinearProgress from '@mui/material/LinearProgress';
import { ReactElement, useEffect, useState } from 'react';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import { useGetPublicationUsernameNameRevisionAll } from '../../lib/api/publications/publications';
import { ApiErrorResponse, FileResponse, GetPublicationUsernameNameRevisionAll200, Review } from '../../lib/api/models';

interface ReviewEditorProps {
    review: Review;
}

interface CodeSourceListProps {
    entries: FileResponse[];
    review: Review;
}

function CodeSourceList({ entries, review }: CodeSourceListProps) {
    return (
        <>
            {entries.map((entry) => {
                return (
                    <CodeRenderer
                        review={review}
                        key={entry.filename}
                        titleBar
                        filename={entry.filename}
                        contents={entry.contents}
                    />
                );
            })}
        </>
    );
}

export default function ReviewEditor({ review }: ReviewEditorProps): ReactElement {
    const { publication, owner } = review;

    const fileQuery = useGetPublicationUsernameNameRevisionAll(
        publication.owner.username,
        publication.name,
        publication.revision,
    );
    const [resourceResponse, setResourceResponse] = useState<
        ContentState<GetPublicationUsernameNameRevisionAll200, ApiErrorResponse>
    >({
        state: 'loading',
    });

    useEffect(() => {
        fileQuery.refetch();
    }, [publication.id, owner.id]);

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
                        position: 'absolute',
                        p: 1,
                        flex: 1,
                        minWidth: 800,
                        flexDirection: 'row',
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            width: '30%',
                            maxWidth: 300,
                            position: 'relative',
                            borderRight: 1,
                            borderColor: 'divider',
                            overflowY: 'scroll',
                        }}
                    >
                        <TreeView paths={entries.map((entry) => entry.filename)} />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            flex: 1,
                            overflowY: 'scroll',
                            zIndex: 1000,
                        }}
                    >
                        <CodeSourceList entries={entries} review={review} />
                    </Box>
                </Box>
            );
        }
    }
}
