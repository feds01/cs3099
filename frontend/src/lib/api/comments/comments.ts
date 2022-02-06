/**
 * Generated by orval v6.5.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
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
import type {
    GetThreadId200,
    ApiErrorResponse,
    NoContentResponse,
    GetCommentId200,
    PatchCommentId200,
    PatchComment,
} from '.././models';
import { customInstance } from '.././mutator/custom-instance';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * Get comments for a particular thread.
 */
export const getThreadId = (id: string) => {
    return customInstance<GetThreadId200>({ url: `/thread/${id}`, method: 'get' });
};

export const getGetThreadIdQueryKey = (id: string) => [`/thread/${id}`];

export const useGetThreadId = <TData = AsyncReturnType<typeof getThreadId>, TError = ApiErrorResponse>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getThreadId>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetThreadIdQueryKey(id);

    const queryFn: QueryFunction<AsyncReturnType<typeof getThreadId>> = () => getThreadId(id);

    const query = useQuery<AsyncReturnType<typeof getThreadId>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * Get a paginated list of publication revisions.
 */
export const deleteThreadId = (id: string) => {
    return customInstance<NoContentResponse>({ url: `/thread/${id}`, method: 'delete' });
};

export const useDeleteThreadId = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof deleteThreadId>, TError, { id: string }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof deleteThreadId>, { id: string }> = (props) => {
        const { id } = props || {};

        return deleteThreadId(id);
    };

    return useMutation<AsyncReturnType<typeof deleteThreadId>, TError, { id: string }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * get comment by user id.
 * @summary Get a comment
 */
export const getCommentId = (id: string) => {
    return customInstance<GetCommentId200>({ url: `/comment/${id}`, method: 'get' });
};

export const getGetCommentIdQueryKey = (id: string) => [`/comment/${id}`];

export const useGetCommentId = <TData = AsyncReturnType<typeof getCommentId>, TError = ApiErrorResponse>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getCommentId>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetCommentIdQueryKey(id);

    const queryFn: QueryFunction<AsyncReturnType<typeof getCommentId>> = () => getCommentId(id);

    const query = useQuery<AsyncReturnType<typeof getCommentId>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * update the contents of a comment by id.
 * @summary Update a comment
 */
export const patchCommentId = (id: string, patchComment: PatchComment) => {
    return customInstance<PatchCommentId200>({ url: `/comment/${id}`, method: 'patch', data: patchComment });
};

export const usePatchCommentId = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof patchCommentId>,
        TError,
        { id: string; data: PatchComment },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof patchCommentId>, { id: string; data: PatchComment }> = (
        props,
    ) => {
        const { id, data } = props || {};

        return patchCommentId(id, data);
    };

    return useMutation<AsyncReturnType<typeof patchCommentId>, TError, { id: string; data: PatchComment }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * delete comment by user id.
 * @summary Delete a comment
 */
export const deleteCommentId = (id: string) => {
    return customInstance<NoContentResponse>({ url: `/comment/${id}`, method: 'delete' });
};

export const useDeleteCommentId = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof deleteCommentId>, TError, { id: string }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof deleteCommentId>, { id: string }> = (props) => {
        const { id } = props || {};

        return deleteCommentId(id);
    };

    return useMutation<AsyncReturnType<typeof deleteCommentId>, TError, { id: string }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
