import CommentThreadRenderer from '../../../../components/CommentThreadRenderer';
import PublicationLink from '../../../../components/PublicationLink';
import UserLink from '../../../../components/UserLink';
import { useReviewState } from '../../../../hooks/review';
import { getPublicationUsernameNameTreePath } from '../../../../lib/api/publications/publications';
import {
    CommentThread,
    extractGeneralCommentsFromThreads,
    sortCommentsIntoFileMap,
    sortCommentsIntoThreads,
} from '../../../../lib/utils/comment';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { formatDistance } from 'date-fns';
import { useEffect, useState } from 'react';

interface ConversationViewProps {}

export default function ConversionView(_props: ConversationViewProps) {
    const { review, comments } = useReviewState();
    const [generalComments, setGeneralComments] = useState<CommentThread[]>([]);
    const [fileCommentMap, setFileCommentMap] = useState<Map<string, CommentThread[]>>(new Map());

    const [fileContentMap, setFileContentMap] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        const commentThreads = sortCommentsIntoThreads(comments);

        setFileCommentMap(sortCommentsIntoFileMap(commentThreads));
        setGeneralComments(extractGeneralCommentsFromThreads(commentThreads));
    }, [comments]);

    useEffect(() => {
        async function fetchFiles() {
            const newFiles = new Map<string, string>();

            console.log(fileCommentMap.keys());
            for (const fileName of fileCommentMap.keys()) {
                if (!fileContentMap.has(fileName)) {
                    const contents = await getPublicationUsernameNameTreePath(
                        review.owner.username,
                        review.publication.name,
                        fileName,
                    );

                    // Since comments can only be made on files...
                    if (contents.entry.type === 'file') {
                        newFiles.set(fileName, contents.entry.contents);
                    }
                }
            }

            setFileContentMap(new Map([...fileContentMap, ...newFiles]));
        }

        fetchFiles();
    }, [fileCommentMap]);

    return (
        <Container maxWidth="md" sx={{ pt: 2 }}>
            <Box sx={{ mb: 1 }}>
                <Typography variant={'h4'}>
                    Review on {<PublicationLink username={review.publication.owner.username} {...review.publication} />}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography>
                        by <UserLink username={review.owner.username} />{' '}
                        {formatDistance(review.createdAt, new Date(), { addSuffix: true })}
                    </Typography>
                </Box>
            </Box>

            {[...fileCommentMap.entries()].map(([fileName, threads]) => {
                const contents = fileContentMap.get(fileName);

                return threads.map((thread) => {
                    return (
                        <Box key={thread.id} sx={{ pt: 1, pb: 1 }}>
                            <CommentThreadRenderer contents={contents} thread={thread} review={review} />
                        </Box>
                    );
                });
            })}

            <Box>
                {generalComments.map((thread) => {
                    return <CommentThreadRenderer thread={thread} review={review} key={thread.id} />;
                })}
            </Box>
        </Container>
    );
}
