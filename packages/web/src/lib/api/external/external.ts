/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type {
    UserAuthResponseResponse,
    ApiErrorResponse,
    GetSgSsoLoginParams,
    TokenVerificationResponseResponse,
    PostSgSsoVerifyParams,
    NoContentResponse,
    GetSgSsoCallbackParams,
    PostSgResourcesImportParams,
    PublicationExportResponseResponse,
    PublicationMetadataResponseResponse,
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
 * Endpoint for external services to authenticate with this service.
 * @summary External login endpoint
 */
export const getSgSsoLogin = (params?: GetSgSsoLoginParams) => {
    return customInstance<UserAuthResponseResponse>({ url: `/sg/sso/login`, method: 'get', params });
};

export const getGetSgSsoLoginQueryKey = (params?: GetSgSsoLoginParams) => [
    `/sg/sso/login`,
    ...(params ? [params] : []),
];

export const useGetSgSsoLogin = <TData = AsyncReturnType<typeof getSgSsoLogin>, TError = ApiErrorResponse>(
    params?: GetSgSsoLoginParams,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getSgSsoLogin>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetSgSsoLoginQueryKey(params);

    const queryFn: QueryFunction<AsyncReturnType<typeof getSgSsoLogin>> = () => getSgSsoLogin(params);

    const query = useQuery<AsyncReturnType<typeof getSgSsoLogin>, TError, TData>(queryKey, queryFn, queryOptions);

    return {
        queryKey,
        ...query,
    };
};

/**
 * Endpoint verify a user session
 * @summary Fetch user information
 */
export const postSgSsoVerify = (params?: PostSgSsoVerifyParams) => {
    return customInstance<TokenVerificationResponseResponse>({ url: `/sg/sso/verify`, method: 'post', params });
};

export const usePostSgSsoVerify = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postSgSsoVerify>,
        TError,
        { params?: PostSgSsoVerifyParams },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postSgSsoVerify>, { params?: PostSgSsoVerifyParams }> = (
        props,
    ) => {
        const { params } = props || {};

        return postSgSsoVerify(params);
    };

    return useMutation<AsyncReturnType<typeof postSgSsoVerify>, TError, { params?: PostSgSsoVerifyParams }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * This endpoint is used to notify the journal that the external login was successful and we should proceed with authenticating the external user. This might mean that there is an internal process of registering the user on the platform.
 * @summary Successful external login endpoint.
 */
export const getSgSsoCallback = (params?: GetSgSsoCallbackParams) => {
    return customInstance<unknown>({ url: `/sg/sso/callback`, method: 'get', params });
};

export const getGetSgSsoCallbackQueryKey = (params?: GetSgSsoCallbackParams) => [
    `/sg/sso/callback`,
    ...(params ? [params] : []),
];

export const useGetSgSsoCallback = <
    TData = AsyncReturnType<typeof getSgSsoCallback>,
    TError = NoContentResponse | ApiErrorResponse,
>(
    params?: GetSgSsoCallbackParams,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getSgSsoCallback>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetSgSsoCallbackQueryKey(params);

    const queryFn: QueryFunction<AsyncReturnType<typeof getSgSsoCallback>> = () => getSgSsoCallback(params);

    const query = useQuery<AsyncReturnType<typeof getSgSsoCallback>, TError, TData>(queryKey, queryFn, queryOptions);

    return {
        queryKey,
        ...query,
    };
};

/**
 * @summary Endpoint to download the publication metadata
 */
export const postSgResourcesImport = (params?: PostSgResourcesImportParams) => {
    return customInstance<NoContentResponse>({ url: `/sg/resources/import`, method: 'post', params });
};

export const usePostSgResourcesImport = <TError = ApiErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postSgResourcesImport>,
        TError,
        { params?: PostSgResourcesImportParams },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof postSgResourcesImport>,
        { params?: PostSgResourcesImportParams }
    > = (props) => {
        const { params } = props || {};

        return postSgResourcesImport(params);
    };

    return useMutation<
        AsyncReturnType<typeof postSgResourcesImport>,
        TError,
        { params?: PostSgResourcesImportParams },
        TContext
    >(mutationFn, mutationOptions);
};
/**
 * @summary Endpoint to download an archive representing the publication sources.
 */
export const getSgResourcesExportId = (id: string) => {
    return customInstance<PublicationExportResponseResponse>({ url: `/sg/resources/export/${id}`, method: 'get' });
};

export const getGetSgResourcesExportIdQueryKey = (id: string) => [`/sg/resources/export/${id}`];

export const useGetSgResourcesExportId = <
    TData = AsyncReturnType<typeof getSgResourcesExportId>,
    TError = ApiErrorResponse,
>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getSgResourcesExportId>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetSgResourcesExportIdQueryKey(id);

    const queryFn: QueryFunction<AsyncReturnType<typeof getSgResourcesExportId>> = () => getSgResourcesExportId(id);

    const query = useQuery<AsyncReturnType<typeof getSgResourcesExportId>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * @summary Endpoint to download the publication metadata
 */
export const getSgResourcesExportIdMetadata = (id: string) => {
    return customInstance<PublicationMetadataResponseResponse>({
        url: `/sg/resources/export/${id}/metadata`,
        method: 'get',
    });
};

export const getGetSgResourcesExportIdMetadataQueryKey = (id: string) => [`/sg/resources/export/${id}/metadata`];

export const useGetSgResourcesExportIdMetadata = <
    TData = AsyncReturnType<typeof getSgResourcesExportIdMetadata>,
    TError = ApiErrorResponse,
>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getSgResourcesExportIdMetadata>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetSgResourcesExportIdMetadataQueryKey(id);

    const queryFn: QueryFunction<AsyncReturnType<typeof getSgResourcesExportIdMetadata>> = () =>
        getSgResourcesExportIdMetadata(id);

    const query = useQuery<AsyncReturnType<typeof getSgResourcesExportIdMetadata>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * @summary Endpoint to fetch user information about a particular user.
 */
export const getSgUsersId = (id: string) => {
    return customInstance<TokenVerificationResponseResponse>({ url: `/sg/users/${id}`, method: 'get' });
};

export const getGetSgUsersIdQueryKey = (id: string) => [`/sg/users/${id}`];

export const useGetSgUsersId = <TData = AsyncReturnType<typeof getSgUsersId>, TError = ApiErrorResponse>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getSgUsersId>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetSgUsersIdQueryKey(id);

    const queryFn: QueryFunction<AsyncReturnType<typeof getSgUsersId>> = () => getSgUsersId(id);

    const query = useQuery<AsyncReturnType<typeof getSgUsersId>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};
