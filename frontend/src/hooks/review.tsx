import { Comment, Review } from '../lib/api/models';
import React from 'react';

export interface ReviewState {
    review: Review;
    comments: Comment[];
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
    state: { comments: [], review: {} },
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
