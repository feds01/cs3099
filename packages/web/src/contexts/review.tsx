import { Comment, Review } from '../lib/api/models';
import { Permission } from '../lib/utils/roles';
import React from 'react';

/** Internal state of the ReviewProvider */
export interface ReviewState {
    /** The review document */
    review: Review;
    /** Any comments that are attached to the current review */
    comments: Comment[];
    /** The permissions that the current user has on the review */
    permission: Permission;
}

export interface ReviewDispatch {
    refetch: () => void;
}

export type ReviewContext = {
    state: ReviewState;
    dispatch: ReviewDispatch;
};

const ReviewStateContext = React.createContext<ReviewContext>({
    // @ts-ignore
    state: { comments: [], review: {}, permission: { modify: false, delete: false } },
    dispatch: {
        refetch: () => undefined,
    },
});

interface ReviewProviderProps {
    children: React.ReactNode;
    state: ReviewState;
    refetch: () => void;
}

export const ReviewProvider = ({ children, state, refetch }: ReviewProviderProps) => {
    return (
        <ReviewStateContext.Provider value={{ state, dispatch: { refetch } }}>{children}</ReviewStateContext.Provider>
    );
};

export function useReviewDispatch(): ReviewDispatch {
    const context = React.useContext(ReviewStateContext);

    if (context === undefined) {
        throw new Error('useReviewDispatch must be used within ReviewProvider');
    }

    return context.dispatch;
}

export function useReviewState(): ReviewState {
    const context = React.useContext(ReviewStateContext);

    if (context === undefined) {
        throw new Error('useReviewState must be used within ReviewProvider');
    }

    return context.state;
}
