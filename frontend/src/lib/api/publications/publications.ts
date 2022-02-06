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
    CreatePublicationResponseResponse,
    ApiErrorResponse,
    CreatePublicationRequest,
    ApiSuccessResponse,
    DeletePublicationUsernameNameParams,
    PatchPublicationResponseResponse,
    PatchPublicationRequest,
    PatchPublicationUsernameNameParams,
    GetPublicationUsernameName200,
    GetPublicationUsernameNameParams,
    GetPublicationUsername200,
    GetPublicationUsernameParams,
    PostPublicationUsernameNameExportParams,
    GetPublicationUsernameNameRevisions200,
    ResourceResponseResponse,
    GetPublicationUsernameNameTreePathParams,
    GetPublicationUsernameNameAll200,
    GetPublicationUsernameNameAllParams,
} from '.././models';
import { customInstance } from '.././mutator/custom-instance';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * Create a new publication resource for a given user account.
 * @summary Create a publication
 */
export const postPublication = (createPublicationRequest: CreatePublicationRequest) => {
    return customInstance<CreatePublicationResponseResponse>({
        url: `/publication`,
        method: 'post',
        data: createPublicationRequest,
    });
};

export const usePostPublication = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postPublication>,
        TError,
        { data: CreatePublicationRequest },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postPublication>, { data: CreatePublicationRequest }> = (
        props,
    ) => {
        const { data } = props || {};

        return postPublication(data);
    };

    return useMutation<AsyncReturnType<typeof postPublication>, TError, { data: CreatePublicationRequest }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * Delete the publication resource.
 * @summary Delete a publication
 */
export const deletePublicationUsernameName = (
    username: string,
    name: string,
    params?: DeletePublicationUsernameNameParams,
) => {
    return customInstance<ApiSuccessResponse>({ url: `/publication/${username}/${name}`, method: 'delete', params });
};

export const useDeletePublicationUsernameName = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof deletePublicationUsernameName>,
        TError,
        { username: string; name: string; params?: DeletePublicationUsernameNameParams },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof deletePublicationUsernameName>,
        { username: string; name: string; params?: DeletePublicationUsernameNameParams }
    > = (props) => {
        const { username, name, params } = props || {};

        return deletePublicationUsernameName(username, name, params);
    };

    return useMutation<
        AsyncReturnType<typeof deletePublicationUsernameName>,
        TError,
        { username: string; name: string; params?: DeletePublicationUsernameNameParams },
        TContext
    >(mutationFn, mutationOptions);
};
/**
 * Patch the publication resource.
 * @summary Patch an existing publication
 */
export const patchPublicationUsernameName = (
    username: string,
    name: string,
    patchPublicationRequest: PatchPublicationRequest,
    params?: PatchPublicationUsernameNameParams,
) => {
    return customInstance<PatchPublicationResponseResponse>({
        url: `/publication/${username}/${name}`,
        method: 'patch',
        data: patchPublicationRequest,
        params,
    });
};

export const usePatchPublicationUsernameName = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof patchPublicationUsernameName>,
        TError,
        { username: string; name: string; data: PatchPublicationRequest; params?: PatchPublicationUsernameNameParams },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof patchPublicationUsernameName>,
        { username: string; name: string; data: PatchPublicationRequest; params?: PatchPublicationUsernameNameParams }
    > = (props) => {
        const { username, name, data, params } = props || {};

        return patchPublicationUsernameName(username, name, data, params);
    };

    return useMutation<
        AsyncReturnType<typeof patchPublicationUsernameName>,
        TError,
        { username: string; name: string; data: PatchPublicationRequest; params?: PatchPublicationUsernameNameParams },
        TContext
    >(mutationFn, mutationOptions);
};
/**
 * Get a publication resource for a given user account with the specified name. This will return the most recent publication revision.
 * @summary Get a publication
 */
export const getPublicationUsernameName = (
    username: string,
    name: string,
    params?: GetPublicationUsernameNameParams,
) => {
    return customInstance<GetPublicationUsernameName200>({
        url: `/publication/${username}/${name}`,
        method: 'get',
        params,
    });
};

export const getGetPublicationUsernameNameQueryKey = (
    username: string,
    name: string,
    params?: GetPublicationUsernameNameParams,
) => [`/publication/${username}/${name}`, ...(params ? [params] : [])];

export const useGetPublicationUsernameName = <
    TData = AsyncReturnType<typeof getPublicationUsernameName>,
    TError = ApiErrorResponse,
>(
    username: string,
    name: string,
    params?: GetPublicationUsernameNameParams,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameName>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameNameQueryKey(username, name, params);

    const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameName>> = () =>
        getPublicationUsernameName(username, name, params);

    const query = useQuery<AsyncReturnType<typeof getPublicationUsernameName>, TError, TData>(queryKey, queryFn, {
        enabled: !!(username && name),
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * Get a list of publications that the user owns.
 * @summary Get a user's publications
 */
export const getPublicationUsername = (username: string, params?: GetPublicationUsernameParams) => {
    return customInstance<GetPublicationUsername200>({ url: `/publication/${username}`, method: 'get', params });
};

export const getGetPublicationUsernameQueryKey = (username: string, params?: GetPublicationUsernameParams) => [
    `/publication/${username}`,
    ...(params ? [params] : []),
];

export const useGetPublicationUsername = <
    TData = AsyncReturnType<typeof getPublicationUsername>,
    TError = ApiErrorResponse,
>(
    username: string,
    params?: GetPublicationUsernameParams,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getPublicationUsername>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameQueryKey(username, params);

    const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsername>> = () =>
        getPublicationUsername(username, params);

    const query = useQuery<AsyncReturnType<typeof getPublicationUsername>, TError, TData>(queryKey, queryFn, {
        enabled: !!username,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * Begin a transactional request to export a publication.
 * @summary Export a publication
 */
export const postPublicationUsernameNameExport = (
    username: string,
    name: string,
    params?: PostPublicationUsernameNameExportParams,
) => {
    return customInstance<ApiSuccessResponse>({
        url: `/publication/${username}/${name}/export`,
        method: 'post',
        params,
    });
};

export const usePostPublicationUsernameNameExport = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postPublicationUsernameNameExport>,
        TError,
        { username: string; name: string; params?: PostPublicationUsernameNameExportParams },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof postPublicationUsernameNameExport>,
        { username: string; name: string; params?: PostPublicationUsernameNameExportParams }
    > = (props) => {
        const { username, name, params } = props || {};

        return postPublicationUsernameNameExport(username, name, params);
    };

    return useMutation<
        AsyncReturnType<typeof postPublicationUsernameNameExport>,
        TError,
        { username: string; name: string; params?: PostPublicationUsernameNameExportParams },
        TContext
    >(mutationFn, mutationOptions);
};
/**
 * Get a paginated list of publication revisions.
 * @summary Get a list of revisions for a publication
 */
export const getPublicationUsernameNameRevisions = (username: string, name: string) => {
    return customInstance<GetPublicationUsernameNameRevisions200>({
        url: `/publication/${username}/${name}/revisions`,
        method: 'get',
    });
};

export const getGetPublicationUsernameNameRevisionsQueryKey = (username: string, name: string) => [
    `/publication/${username}/${name}/revisions`,
];

export const useGetPublicationUsernameNameRevisions = <
    TData = AsyncReturnType<typeof getPublicationUsernameNameRevisions>,
    TError = ApiErrorResponse,
>(
    username: string,
    name: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameNameRevisions>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameNameRevisionsQueryKey(username, name);

    const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameNameRevisions>> = () =>
        getPublicationUsernameNameRevisions(username, name);

    const query = useQuery<AsyncReturnType<typeof getPublicationUsernameNameRevisions>, TError, TData>(
        queryKey,
        queryFn,
        { enabled: !!(username && name), ...queryOptions },
    );

    return {
        queryKey,
        ...query,
    };
};

/**
 * Get a publication resource file for a given user account with the specified name. This will return the most recent publication revision.
 * @summary Get a file from a publication
 */
export const getPublicationUsernameNameTreePath = (
    username: string,
    name: string,
    path: string,
    params?: GetPublicationUsernameNameTreePathParams,
) => {
    return customInstance<ResourceResponseResponse>({
        url: `/publication/${username}/${name}/tree/${path}`,
        method: 'get',
        params,
    });
};

export const getGetPublicationUsernameNameTreePathQueryKey = (
    username: string,
    name: string,
    path: string,
    params?: GetPublicationUsernameNameTreePathParams,
) => [`/publication/${username}/${name}/tree/${path}`, ...(params ? [params] : [])];

export const useGetPublicationUsernameNameTreePath = <
    TData = AsyncReturnType<typeof getPublicationUsernameNameTreePath>,
    TError = ApiErrorResponse,
>(
    username: string,
    name: string,
    path: string,
    params?: GetPublicationUsernameNameTreePathParams,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameNameTreePath>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey =
        queryOptions?.queryKey ?? getGetPublicationUsernameNameTreePathQueryKey(username, name, path, params);

    const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameNameTreePath>> = () =>
        getPublicationUsernameNameTreePath(username, name, path, params);

    const query = useQuery<AsyncReturnType<typeof getPublicationUsernameNameTreePath>, TError, TData>(
        queryKey,
        queryFn,
        { enabled: !!(username && name && path), ...queryOptions },
    );

    return {
        queryKey,
        ...query,
    };
};

/**
 * @summary Get a paginated list of sources for a publication
 */
export const getPublicationUsernameNameAll = (
    username: string,
    name: string,
    params?: GetPublicationUsernameNameAllParams,
) => {
    return customInstance<GetPublicationUsernameNameAll200>({
        url: `/publication/${username}/${name}/all`,
        method: 'get',
        params,
    });
};

export const getGetPublicationUsernameNameAllQueryKey = (
    username: string,
    name: string,
    params?: GetPublicationUsernameNameAllParams,
) => [`/publication/${username}/${name}/all`, ...(params ? [params] : [])];

export const useGetPublicationUsernameNameAll = <
    TData = AsyncReturnType<typeof getPublicationUsernameNameAll>,
    TError = ApiErrorResponse,
>(
    username: string,
    name: string,
    params?: GetPublicationUsernameNameAllParams,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameNameAll>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameNameAllQueryKey(username, name, params);

    const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameNameAll>> = () =>
        getPublicationUsernameNameAll(username, name, params);

    const query = useQuery<AsyncReturnType<typeof getPublicationUsernameNameAll>, TError, TData>(queryKey, queryFn, {
        enabled: !!(username && name),
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};
