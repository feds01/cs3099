/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type {
    PostPublicationUsernameNameRevisionReview200,
    ApiErrorResponse,
    GetPublicationUsernameNameRevisionReviews200,
    GetPublicationUsernameNameRevisionReviewsParams,
    PutReviewIdComment200,
    CreateCommentRequestBody,
    GetReviewId200,
    NoContentResponse,
    GetReviewIdComments200,
} from '.././models';
import { customInstance } from '.././mutator/custom-instance';
import {
    useQuery,
    useMutation,
    UseQueryOptions,
    UseMutationOptions,
    QueryFunction,
    MutationFunction,
    UseQueryResult,
    QueryKey,
} from 'react-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * Begin a review process on a publication.
 * @summary Create a review on a publication.
 */
export const postPublicationUsernameNameRevisionReview = (username: string, name: string, revision: string) => {
    return customInstance<PostPublicationUsernameNameRevisionReview200>({
        url: `/publication/${username}/${name}/${revision}/review`,
        method: 'post',
    });
};

export const usePostPublicationUsernameNameRevisionReview = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postPublicationUsernameNameRevisionReview>,
        TError,
        { username: string; name: string; revision: string },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof postPublicationUsernameNameRevisionReview>,
        { username: string; name: string; revision: string }
    > = (props) => {
        const { username, name, revision } = props || {};

        return postPublicationUsernameNameRevisionReview(username, name, revision);
    };

    return useMutation<
        AsyncReturnType<typeof postPublicationUsernameNameRevisionReview>,
        TError,
        { username: string; name: string; revision: string },
        TContext
    >(mutationFn, mutationOptions);
};
/**
 * Get a paginated list of publication reviews.
 * @summary Get a list of reviews on a publication
 */
export const getPublicationUsernameNameRevisionReviews = (
    username: string,
    name: string,
    revision: string,
    params?: GetPublicationUsernameNameRevisionReviewsParams,
) => {
    return customInstance<GetPublicationUsernameNameRevisionReviews200>({
        url: `/publication/${username}/${name}/${revision}/reviews`,
        method: 'get',
        params,
    });
};

export const getGetPublicationUsernameNameRevisionReviewsQueryKey = (
    username: string,
    name: string,
    revision: string,
    params?: GetPublicationUsernameNameRevisionReviewsParams,
) => [`/publication/${username}/${name}/${revision}/reviews`, ...(params ? [params] : [])];

export const useGetPublicationUsernameNameRevisionReviews = <
    TData = AsyncReturnType<typeof getPublicationUsernameNameRevisionReviews>,
    TError = ApiErrorResponse,
>(
    username: string,
    name: string,
    revision: string,
    params?: GetPublicationUsernameNameRevisionReviewsParams,
    options?: {
        query?: UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameNameRevisionReviews>, TError, TData>;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey =
        queryOptions?.queryKey ??
        getGetPublicationUsernameNameRevisionReviewsQueryKey(username, name, revision, params);

    const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameNameRevisionReviews>> = () =>
        getPublicationUsernameNameRevisionReviews(username, name, revision, params);

    const query = useQuery<AsyncReturnType<typeof getPublicationUsernameNameRevisionReviews>, TError, TData>(
        queryKey,
        queryFn,
        { enabled: !!(username && name && revision), ...queryOptions },
    );

    return {
        queryKey,
        ...query,
    };
};

/**
 * Comment on a review, specified by the review id.
 * @summary Add a comment to a review.
 */
export const putReviewIdComment = (id: string, createCommentRequestBody: CreateCommentRequestBody) => {
    return customInstance<PutReviewIdComment200>({
        url: `/review/${id}/comment`,
        method: 'put',
        data: createCommentRequestBody,
    });
};

export const usePutReviewIdComment = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof putReviewIdComment>,
        TError,
        { id: string; data: CreateCommentRequestBody },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof putReviewIdComment>,
        { id: string; data: CreateCommentRequestBody }
    > = (props) => {
        const { id, data } = props || {};

        return putReviewIdComment(id, data);
    };

    return useMutation<
        AsyncReturnType<typeof putReviewIdComment>,
        TError,
        { id: string; data: CreateCommentRequestBody },
        TContext
    >(mutationFn, mutationOptions);
};
/**
 * get review by user id.
 * @summary Get a review.
 */
export const getReviewId = (id: string) => {
    return customInstance<GetReviewId200>({ url: `/review/${id}`, method: 'get' });
};

export const getGetReviewIdQueryKey = (id: string) => [`/review/${id}`];

export const useGetReviewId = <TData = AsyncReturnType<typeof getReviewId>, TError = ApiErrorResponse>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getReviewId>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetReviewIdQueryKey(id);

    const queryFn: QueryFunction<AsyncReturnType<typeof getReviewId>> = () => getReviewId(id);

    const query = useQuery<AsyncReturnType<typeof getReviewId>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * delete review by user id.
 * @summary Delete a review
 */
export const deleteReviewId = (id: string) => {
    return customInstance<NoContentResponse>({ url: `/review/${id}`, method: 'delete' });
};

export const useDeleteReviewId = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof deleteReviewId>, TError, { id: string }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof deleteReviewId>, { id: string }> = (props) => {
        const { id } = props || {};

        return deleteReviewId(id);
    };

    return useMutation<AsyncReturnType<typeof deleteReviewId>, TError, { id: string }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * get a paginated list of comments on a review.
 * @summary Get comments on a review.
 */
export const getReviewIdComments = (id: string) => {
    return customInstance<GetReviewIdComments200>({ url: `/review/${id}/comments`, method: 'get' });
};

export const getGetReviewIdCommentsQueryKey = (id: string) => [`/review/${id}/comments`];

export const useGetReviewIdComments = <TData = AsyncReturnType<typeof getReviewIdComments>, TError = ApiErrorResponse>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getReviewIdComments>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetReviewIdCommentsQueryKey(id);

    const queryFn: QueryFunction<AsyncReturnType<typeof getReviewIdComments>> = () => getReviewIdComments(id);

    const query = useQuery<AsyncReturnType<typeof getReviewIdComments>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * Publish the drafted review.
 * @summary Finalise a review.
 */
export const postReviewIdComplete = (id: string) => {
    return customInstance<NoContentResponse>({ url: `/review/${id}/complete`, method: 'post' });
};

export const usePostReviewIdComplete = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof postReviewIdComplete>, TError, { id: string }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postReviewIdComplete>, { id: string }> = (props) => {
        const { id } = props || {};

        return postReviewIdComplete(id);
    };

    return useMutation<AsyncReturnType<typeof postReviewIdComplete>, TError, { id: string }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
