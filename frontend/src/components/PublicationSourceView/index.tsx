import BreadCrumb from './BreadCrumb';
import Box from '@mui/material/Box';
import ErrorBanner from '../ErrorBanner';
import DirectoryViewer from '../DirectoryViewer';
import { ContentState } from '../../types/requests';
import { ReactElement, useEffect, useState } from 'react';
import { Divider, LinearProgress } from '@mui/material';
import { ApiErrorResponse, ResourceResponseResponse } from '../../lib/api/models';
import { constructBasePath, PublicationIndex } from '../../lib/utils/publications';
import CodeRenderer from '../CodeRenderer';

interface SourceViewerProps {
    filename: string;
    basePath: string;
    index: PublicationIndex;
    contents: ContentState<ResourceResponseResponse, ApiErrorResponse>;
}

function SourceViewer({ contents, filename, basePath }: SourceViewerProps): ReactElement {
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
                return <CodeRenderer contents={entry.contents} filename={filename} />;
            } else {
                return (
                    <DirectoryViewer type={entry.type} entries={entry.entries} basePath={basePath} filename={filename} />
                );
            }
        }
    }
}

type Props = {
    index: PublicationIndex;
    contents: ContentState<ResourceResponseResponse, any>;
    filename: string;
};

export default function PublicationViewSource({ contents, filename, index }: Props): ReactElement {
    const [basePath, setBasePath] = useState<string>(constructBasePath(index));

    useEffect(() => {
        setBasePath(constructBasePath(index));
    }, [index]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <BreadCrumb index={index} basePath={basePath} filename={filename} />
            <Divider />
            <Box>
                <SourceViewer index={index} contents={contents} basePath={basePath} filename={filename} />
            </Box>
        </Box>
    );
}
