import { SxProps, Theme } from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { Review } from '../../lib/api/models';
import { CommentThread } from '../../lib/utils/comment';
import { constructBasePath, PublicationIndex } from '../../lib/utils/publications';
import CodeRenderer from '../CodeRenderer';
import ImageViewer from './ImageViewer';

// This is used to represent the default maximum size of source files that are
// rendered without the user explicitly asking them to be rendered.
const DEFAULT_SOURCE_FILE_LIMIT = 500;

/** Function to check whether contents of a file should be automatically rendered. */
function shouldRenderByDefault(contents: string): boolean {
    return contents.split(/\r\n|\r|\n/).length < DEFAULT_SOURCE_FILE_LIMIT;
}

/**
 * This is a component used to display a file that won't be automatically loaded due to it's large size.
 *
 * @param props - Any props that are passed to the Box component that surrounds the inner body.
 */
const FileSkeleton = (props: BoxProps) => {
    return (
        <Box {...props}>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}>
                <Skeleton animation={false} width={80} sx={{ mr: 1 }}>
                    <Typography>.</Typography>
                </Skeleton>
                <Skeleton animation={false} width={97}>
                    <Typography>.</Typography>
                </Skeleton>
            </Box>
            <Skeleton animation={false} width={140}>
                <Typography>.</Typography>
            </Skeleton>
            <Skeleton animation={false} width={97}>
                <Typography>.</Typography>
            </Skeleton>
        </Box>
    );
};

type FileViewProps = {
    contents: string;
    filename: string;
    mimeType: string;
    publicationIndex: PublicationIndex;
    review?: Review;
    commentMap?: Map<number, CommentThread[]>;
    worker?: Worker;
    renderLargeFiles?: boolean;
    rendererSx?: SxProps<Theme>;
};

export default function FileViewer({
    contents,
    filename,
    mimeType,
    worker,
    review,
    commentMap,
    renderLargeFiles = true,
    publicationIndex,
    rendererSx,
}: FileViewProps) {
    const [renderSources, setRenderSources] = useState<boolean>(
        renderLargeFiles && mimeType.startsWith('text') ? true : shouldRenderByDefault(contents),
    );

    if (mimeType.startsWith('text')) {
        return (
            <>
                {renderSources ? (
                    <CodeRenderer
                        sx={rendererSx}
                        worker={worker}
                        contents={contents}
                        filename={filename}
                        commentMap={commentMap}
                        review={review}
                    />
                ) : (
                    <>
                        <FileSkeleton sx={{ p: 1, zIndex: 10, width: '100%' }} />
                        <Box
                            sx={{
                                p: 2,
                                zIndex: 20,
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <Button
                                variant="contained"
                                sx={{ fontWeight: 'bold' }}
                                size={'small'}
                                color="primary"
                                onClick={() => {
                                    setRenderSources(true);
                                }}
                            >
                                Load file
                            </Button>
                            <Typography variant={'body1'}>Large files aren't rendered by default</Typography>
                        </Box>
                    </>
                )}
            </>
        );
    }

    // Construct a download URI from the publication index and filename
    const downloadUri =
        `${process.env.REACT_APP_API_URI}/publication${constructBasePath(
            publicationIndex,
            true,
        )}/download/${filename}` +
        (typeof publicationIndex.revision !== 'undefined' ? `?revision=${publicationIndex.revision}` : '');

    return (
        <Box
            sx={{
                height: '100%',
                width: '100%',
                background: 'rgb(246, 248, 250)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...rendererSx,
            }}
        >
            {mimeType.startsWith('image') ? (
                <ImageViewer filename={filename} downloadUri={downloadUri} />
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant={'body1'}>Binary file - view not supported</Typography>
                    <Button
                        variant="contained"
                        sx={{ fontWeight: 'bold', mt: `8px !important` }}
                        size={'small'}
                        color="primary"
                        target={'_blank'}
                        href={downloadUri}
                        component="a"
                    >
                        Open file
                    </Button>
                </Box>
            )}
        </Box>
    );
}
