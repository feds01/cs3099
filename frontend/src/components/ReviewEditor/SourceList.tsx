import Box from '@mui/material/Box';
import FileViewer from '../FileViewer';
import { useEffect, useState } from 'react';
import { useReviewState } from '../../hooks/review';
import { CommentThread } from '../../lib/utils/comment';
import { FileResponse, Review } from '../../lib/api/models';
import CommentThreadRenderer from '../CommentThreadRenderer';

interface CodeSourceListProps {
    entries: FileResponse[];
    review: Review;
}

export default function SourceList({ entries, review }: CodeSourceListProps) {
    // we can get the comments from the current state
    const { comments } = useReviewState();
    const [generalComments, setGeneralComments] = useState<CommentThread[]>([]);
    const [fileCommentMap, setFileCommentMap] = useState<Map<string, CommentThread[]>>(new Map());

    useEffect(() => {
        const newGeneralComments = [];
        const fileMap = new Map<string, CommentThread[]>();

        // first create a default map that maps threads to comments...
        const commentThreads = new Map<string, CommentThread>();

        comments.forEach((comment) => {
            if (commentThreads.has(comment.thread)) {
                let thread = commentThreads.get(comment.thread)!;

                thread.comments.push(comment);

                // @@Cleanup: is this even necessary?
                if (typeof thread.file === 'undefined' || typeof thread.anchor === 'undefined') {
                    if (typeof comment.replying === 'undefined') {
                        thread = {
                            ...thread,
                            file: comment.filename,
                            anchor: comment.anchor,
                        };

                        commentThreads.set(comment.thread, thread);
                    }
                }
            } else {
                commentThreads.set(comment.thread, {
                    comments: [comment],
                    id: comment.id,
                    ...(typeof comment.replying === 'undefined' && {
                        file: comment.filename,
                        anchor: comment.anchor,
                    }),
                });
            }
        });

        // now sort the threads by file/general...
        for (const thread of commentThreads.values()) {
            if (typeof thread.file === 'string') {
                if (fileMap.has(thread.file)) {
                    const originalArr = fileMap.get(thread.file)!;
                    originalArr.push(thread);
                } else {
                    fileMap.set(thread.file, [thread]);
                }
            } else {
                newGeneralComments.push(thread);
            }
        }

        setFileCommentMap(fileMap);
        setGeneralComments(newGeneralComments);
    }, [comments]);

    return (
        <Box sx={{ pb: 4 }}>
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
