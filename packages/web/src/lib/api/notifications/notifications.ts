/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type {
    GetNotifications200,
    ApiErrorResponse,
    GetNotificationsParams,
    GetNotificationsId200,
    NoContentResponse,
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
 * Get a paginated list of notifications for the requester
 * @summary Paginated notifications
 */
export const getNotifications = (params?: GetNotificationsParams) => {
    return customInstance<GetNotifications200>({ url: `/notifications`, method: 'get', params });
};

export const getGetNotificationsQueryKey = (params?: GetNotificationsParams) => [
    `/notifications`,
    ...(params ? [params] : []),
];

export const useGetNotifications = <TData = AsyncReturnType<typeof getNotifications>, TError = ApiErrorResponse>(
    params?: GetNotificationsParams,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getNotifications>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetNotificationsQueryKey(params);

    const queryFn: QueryFunction<AsyncReturnType<typeof getNotifications>> = () => getNotifications(params);

    const query = useQuery<AsyncReturnType<typeof getNotifications>, TError, TData>(queryKey, queryFn, queryOptions);

    return {
        queryKey,
        ...query,
    };
};

/**
 * get notification by id.
 * @summary Get a notification.
 */
export const getNotificationsId = (id: string) => {
    return customInstance<GetNotificationsId200>({ url: `/notifications/${id}`, method: 'get' });
};

export const getGetNotificationsIdQueryKey = (id: string) => [`/notifications/${id}`];

export const useGetNotificationsId = <TData = AsyncReturnType<typeof getNotificationsId>, TError = ApiErrorResponse>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getNotificationsId>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetNotificationsIdQueryKey(id);

    const queryFn: QueryFunction<AsyncReturnType<typeof getNotificationsId>> = () => getNotificationsId(id);

    const query = useQuery<AsyncReturnType<typeof getNotificationsId>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * Mark a publication as seen
 * @summary View notification
 */
export const postNotificationsIdView = (id: string) => {
    return customInstance<NoContentResponse>({ url: `/notifications/${id}/view`, method: 'post' });
};

export const usePostNotificationsIdView = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof postNotificationsIdView>, TError, { id: string }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postNotificationsIdView>, { id: string }> = (props) => {
        const { id } = props || {};

        return postNotificationsIdView(id);
    };

    return useMutation<AsyncReturnType<typeof postNotificationsIdView>, TError, { id: string }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
