import Box from '@mui/material/Box';
import CommentCard from '../CommentCard';
import { Review } from '../../lib/api/models';
import { CommentThread } from '../../lib/utils/comment';

type CommentThreadProps = {
    thread: CommentThread;
    review: Review;
};

export default function CommentThreadRenderer({ thread, review }: CommentThreadProps) {
    return (
        <>
            {thread.comments.map((comment) => {
                return (
                    <Box key={comment.contents} sx={{ pt: 0.5, pb: 0.5 }}>
                        <CommentCard review={review} comment={comment} />
                    </Box>
                );
            })}
        </>
    );
}
