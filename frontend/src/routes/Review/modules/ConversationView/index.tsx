import CommentEditor from '../../../../components/CommentEditor';
import CommentThreadRenderer from '../../../../components/CommentThreadRenderer';
import PublicationLink from '../../../../components/PublicationLink';
import UserLink from '../../../../components/UserLink';
import { useReviewDispatch, useReviewState } from '../../../../contexts/review';
import { getPublicationUsernameNameTreePath } from '../../../../lib/api/publications/publications';
import {
    CommentThread,
    extractGeneralCommentsFromThreads,
    sortCommentsIntoFileMap,
    sortCommentsIntoThreads,
} from '../../../../lib/utils/comment';
import VoidImage from '../../../../static/images/void.svg';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { formatDistance } from 'date-fns';
import { useEffect, useState } from 'react';

interface ConversationViewProps {}

export default function ConversionView(_props: ConversationViewProps) {
    const { refetch } = useReviewDispatch();
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

            for (const fileName of fileCommentMap.keys()) {
                if (!fileContentMap.has(fileName)) {
                    const contents = await getPublicationUsernameNameTreePath(
                        review.publication.owner.username,
                        review.publication.name,
                        fileName,
                        ...(!review.publication.current ? [{ revision: review.publication.revision }] : []),
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
            <Box sx={{ pb: 1 }}>
                <Typography variant={'h4'}>
                    Review on {<PublicationLink username={review.publication.owner.username} {...review.publication} />}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography>
                        by <UserLink user={review.owner} />{' '}
                        {formatDistance(review.createdAt, new Date(), { addSuffix: true })}
                    </Typography>
                </Box>
                <Divider />
            </Box>

            {fileCommentMap.size === 0 && generalComments.length === 0 && (
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <img src={VoidImage} height={128} width={128} alt="void" />
                    <Typography variant={'body1'}>This review doesn't have any comments yet.</Typography>
                </Box>
            )}

            {[...fileCommentMap.entries()].map(([fileName, threads]) => {
                const contents = fileContentMap.get(fileName);

                return threads.map((thread) => {
                    return (
                        <Box key={thread.id} sx={{ pt: 1, pb: 1 }}>
                            <CommentThreadRenderer contents={contents} thread={thread} />
                        </Box>
                    );
                });
            })}

            <Box>
                {generalComments.map((thread) => {
                    return (
                        <Box key={thread.id} sx={{ pt: 1, pb: 1 }}>
                            <CommentThreadRenderer thread={thread} />
                        </Box>
                    );
                })}
            </Box>
            <Box sx={{ pt: 1, maxWidth: 800 }}>
                <CommentEditor type="post" autoFocus={false} reviewId={review.id} uncancelable onClose={refetch} />
            </Box>
        </Container>
    );
}
