import { Comment, CommentAnchor } from '../api/models';

export type CommentThread = {
    comments: Comment[];
    file?: string;
    anchor?: CommentAnchor;
    id: string;
};
