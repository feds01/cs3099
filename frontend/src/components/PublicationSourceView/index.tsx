import { Alert, AlertTitle, Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React, { ReactElement, useEffect, useState } from 'react';
import { ResourceResponseResponse } from '../../lib/api/models';
import { constructBasePath, PublicationIndex } from '../../lib/utils/publications';
import { ContentState } from '../../types/requests';
import DirectoryViewer from '../DirectoryViewer';
import FileViewer from '../FileViewer';
import MarkdownRenderer from '../MarkdownRenderer';
import BreadCrumb from './BreadCrumb';

interface SourceViewerProps {
    filename: string;
    basePath: string;
    index: PublicationIndex;
    contents: ContentState<ResourceResponseResponse, any>;
}

function SourceViewer({ contents, filename, basePath }: SourceViewerProps): ReactElement {
    switch (contents.state) {
        case 'loading': {
            return <div>Loading</div>;
        }
        case 'error': {
            return (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    Failed to fetch resource: <strong>{contents.error?.message}</strong>
                </Alert>
            );
        }
        case 'ok': {
            const { data } = contents.data;

            if (data.type === 'file') {
                return (
                    <FileViewer contents={data.contents} filename={filename} comments={[]} updatedAt={data.updatedAt} />
                );
            } else {
                return (
                    <DirectoryViewer type={data.type} entries={data.entries} basePath={basePath} filename={filename} />
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
        <Container>
            <BreadCrumb index={index} basePath={basePath} filename={filename} />
            <Divider />
            <Box>
                <SourceViewer index={index} contents={contents} basePath={basePath} filename={filename} />
            </Box>
        </Container>
    );
}
