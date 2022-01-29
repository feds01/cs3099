import Box from '@mui/material/Box';
import FileViewer from '../FileViewer';
import CommentCard from '../CommentCard';
import { useEffect, useState } from 'react';
import { useReviewState } from '../../hooks/review';
import { FileResponse, Comment, Review } from '../../lib/api/models';

interface CodeSourceListProps {
    entries: FileResponse[];
    review: Review;
}

export default function SourceList({ entries, review }: CodeSourceListProps) {
    // we can get the comments from the current state
    const { comments } = useReviewState();
    const [generalComments, setGeneralComments] = useState<Comment[]>([]);
    const [fileCommentMap, setFileCommentMap] = useState<Map<string, Comment[]>>(new Map());

    useEffect(() => {
        const newMap = new Map<string, Comment[]>();
        const newGeneralComments: Comment[] = [];

        comments.forEach((comment) => {
            if (typeof comment.filename === 'undefined') {
                newGeneralComments.push(comment);
            } else if (newMap.has(comment.filename)) {
                const originalArr = newMap.get(comment.filename)!;

                newMap.set(comment.filename, [...originalArr, comment]);
            } else {
                newMap.set(comment.filename, [comment]);
            }
        });

        setFileCommentMap(newMap);
        setGeneralComments(newGeneralComments);
    }, [comments]);

    return (
        <Box sx={{ pb: 4 }}>
            {entries.map((entry, index) => {
                const fileComments = fileCommentMap.get(entry.filename);

                return (
                    <Box sx={{ pb: 0.5, pt: index === 0 ? 1 : 0.5 }}>
                        <FileViewer
                            review={review}
                            key={entry.filename}
                            id={`file-${index}`}
                            filename={entry.filename}
                            contents={entry.contents}
                            comments={fileComments}
                        />
                    </Box>
                );
            })}
            <Box>
                {generalComments.map((comment) => {
                    return (
                        <Box key={comment.contents} sx={{ pt: 0.5, pb: 0.5 }}>
                            <CommentCard review={review} comment={comment} />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
