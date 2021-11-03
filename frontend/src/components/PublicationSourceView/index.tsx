import { Alert, AlertTitle, Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React, { ReactElement } from 'react';
import { ResourceResponseResponse } from '../../lib/api/models';
import { ContentState } from '../../types/requests';
import DirectoryViewer from '../DirectoryViewer';
import FileViewer from '../FileViewer';
import BreadCrumb from './BreadCrumb';

interface SourceViewerProps {
    filename: string;
    contents: ContentState<ResourceResponseResponse, any>;
}

export interface PublicationIndex {
    username: string;
    name: string;
    revision?: string;
}

function SourceViewer({ contents, filename }: SourceViewerProps): ReactElement {
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
                return <DirectoryViewer type={data.type} entries={data.entries} filename={filename} />;
            }
        }
    }
}

type Props = SourceViewerProps & PublicationIndex;

export default function PublicationViewSource({ contents, filename, ...rest }: Props): ReactElement {
    return (
        <Container>
            <BreadCrumb {...rest} filename={filename} />
            <Divider/>
            <Box>
                <SourceViewer contents={contents} filename={filename} />
            </Box>
        </Container>
    );
}
