import CommentThreadRenderer from '../../../../components/CommentThreadRenderer';
import { useReviewState } from '../../../../contexts/review';
import { SelectionProvider } from '../../../../contexts/selection';
import { FileResponse } from '../../../../lib/api/models';
import {
    CommentThread,
    extractGeneralCommentsFromThreads,
    sortCommentsIntoFileMap,
    sortCommentsIntoThreads,
} from '../../../../lib/utils/comment';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import FileAccordion from '../../../../components/FileAccordion';

interface CodeSourceListProps {
    entries: FileResponse[];
}

export default function SourceList({ entries }: CodeSourceListProps) {
    // we can get the comments from the current state
    const { comments, review } = useReviewState();
    const [generalComments, setGeneralComments] = useState<CommentThread[]>([]);
    const [fileCommentMap, setFileCommentMap] = useState<Map<string, CommentThread[]>>(new Map());

    useEffect(() => {
        const commentThreads = sortCommentsIntoThreads(comments);

        setFileCommentMap(sortCommentsIntoFileMap(commentThreads));
        setGeneralComments(extractGeneralCommentsFromThreads(commentThreads));
    }, [comments]);

    // This is a reference to the web worker that will be used
    const [worker] = useState<Worker | undefined>(() => {
        // Return a worker instance only if the browser supports workers...
        if (window.Worker) {
            return new Worker(new URL('./../../../../worker/highlight.worker.ts', import.meta.url));
        } else {
            return undefined;
        }
    });

    useEffect(() => {
        return () => {
            worker?.terminate();
        };
    }, []);

    return (
        <Box>
            <SelectionProvider>
                {entries.map((entry, index) => {
                    const fileComments = fileCommentMap.get(entry.filename);

                    return (
                        <Box key={entry.filename} sx={{ pb: 0.5, pt: index === 0 ? 1 : 0.5 }}>
                            <FileAccordion
                                worker={worker}
                                review={review}
                                id={`file-${index}`}
                                mimeType={entry.mimeType}
                                filename={entry.filename}
                                contents={entry.contents}
                                threads={fileComments}
                            />
                        </Box>
                    );
                })}
            </SelectionProvider>
            <Box>
                {generalComments.map((thread) => {
                    return <CommentThreadRenderer thread={thread} key={thread.id} />;
                })}
            </Box>
        </Box>
    );
}
