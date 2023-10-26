import BreadCrumb from './BreadCrumb';
import Box from '@mui/material/Box';
import ErrorBanner from '../ErrorBanner';
import DirectoryViewer from '../DirectoryViewer';
import { ContentState } from '../../types/requests';
import { ReactElement, useEffect, useState } from 'react';
import { Divider, LinearProgress, Typography } from '@mui/material';
import { ApiErrorResponse, ResourceResponseResponse } from '../../lib/api/models';
import { constructBasePath, PublicationIndex } from '../../lib/utils/publications';
import { format } from 'date-fns';
import { byteLength, humanFileSize } from '../../lib/utils/bytes';
import FileViewer from '../FileViewer';

/** Props that are accepted for the SourceViewer  */
interface SourceViewerProps {
    /** Name of the file that is being displayed */
    filename: string;
    /** The base directory path of the file */
    basePath: string;
    /** The index of the publication (useful for requests) */
    index: PublicationIndex;
    /** The returned @see ContentState denoting the request to fetch this file */
    contents: ContentState<ResourceResponseResponse, ApiErrorResponse>;
}

/** Information collected from running file statistics on particular contents */
type FileStats = {
    /** Doesn't always show if the mime-type is not text like */
    sloc?: number;
    /** The logical size of the contents */
    size: number;
};

/**
 * Function to compute useful information about a file's contents including
 * it's size and it's logical number of lines.
 *
 * @param contents
 * @param mimeType
 */
function computeFileStats(contents: string, mimeType: string): FileStats {
    return {
        ...(mimeType.startsWith('text') && { sloc: contents.split(/\r\n|\r|\n/).length }),
        size: byteLength(contents),
    };
}

function SourceViewer({ contents, filename, index, basePath }: SourceViewerProps): ReactElement {
    switch (contents.state) {
        case 'loading': {
            return <LinearProgress />;
        }
        case 'error': {
            return <ErrorBanner message={contents.error.message} />;
        }
        case 'ok': {
            const { entry } = contents.data;

            if (entry.type === 'file') {
                const { contents, updatedAt, mimeType } = entry;
                const fileStats = computeFileStats(contents, mimeType);

                return (
                    <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '6px' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                background: '#fff',
                                borderRadius: '6px 6px 0 0',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                {typeof fileStats.sloc !== 'undefined' && (
                                    <>
                                        <Typography>{fileStats.sloc} lines</Typography>
                                        <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 1 }} />
                                    </>
                                )}
                                <Typography>{humanFileSize(fileStats.size, true)}</Typography>
                            </Box>
                            <Box>Edited on&nbsp;{format(updatedAt, 'do MMM')}</Box>
                        </Box>
                        <FileViewer
                            rendererSx={{ borderRadius: '0 0 6px 6px' }}
                            publicationIndex={index}
                            contents={contents}
                            filename={filename}
                            mimeType={mimeType}
                        />
                    </Box>
                );
            } else {
                return (
                    <DirectoryViewer
                        type={entry.type}
                        entries={entry.entries}
                        basePath={basePath}
                        filename={filename}
                    />
                );
            }
        }
    }
}

type PublicationViewSourceProps = {
    index: PublicationIndex;
    contents: ContentState<ResourceResponseResponse, ApiErrorResponse>;
    filename: string;
};

export default function PublicationViewSource({ contents, filename, index }: PublicationViewSourceProps): ReactElement {
    const [basePath, setBasePath] = useState<string>(constructBasePath(index));

    useEffect(() => {
        setBasePath(constructBasePath(index));
    }, [index]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <BreadCrumb index={index} basePath={basePath} filename={filename} />
            <SourceViewer index={index} contents={contents} basePath={basePath} filename={filename} />
        </Box>
    );
}
