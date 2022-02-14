import CommentThreadRenderer from '../../../../components/CommentThreadRenderer';
import FileViewer from '../../../../components/FileViewer';
import { useReviewState } from '../../../../hooks/review';
import { FileResponse } from '../../../../lib/api/models';
import { CommentThread, extractGeneralCommentsFromThreads, sortCommentsIntoFileMap, sortCommentsIntoThreads } from '../../../../lib/utils/comment';

import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';

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

    return (
        <Box>
            {entries.map((entry, index) => {
                const fileComments = fileCommentMap.get(entry.filename);

                return (
                    <Box key={entry.filename} sx={{ pb: 0.5, pt: index === 0 ? 1 : 0.5 }}>
                        <FileViewer
                            review={review}
                            id={`file-${index}`}
                            filename={entry.filename}
                            contents={entry.contents}
                            threads={fileComments}
                        />
                    </Box>
                );
            })}
            <Box>
                {generalComments.map((thread) => {
                    return <CommentThreadRenderer thread={thread} review={review} key={thread.id} />;
                })}
            </Box>
        </Box>
    );
}
