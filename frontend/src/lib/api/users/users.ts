/**
 * Generated by orval v6.2.3 🍺
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
} from 'react-query';
import type {
    UserAuthResponse,
    BadRequestResponse,
    UnauthorizedResponse,
    InternalServerErrorResponse,
    UserLogin,
    UserRegistration,
    DeleteUserId200,
    GetUserId200,
    NotFoundResponse,
    PatchUserId200,
} from '.././models';
import { customInstance } from '.././mutator/custom-instance';

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * User login endpoint, returning authentication tokens.
 * @summary User Login
 */
export const postUserLogin = (userLogin: UserLogin) => {
    return customInstance<UserAuthResponse>({ url: `/user/login`, method: 'post', data: userLogin });
};

export const usePostUserLogin = <
    TError = BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof postUserLogin>, TError, { data: UserLogin }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postUserLogin>, { data: UserLogin }> = (props) => {
        const { data } = props || {};

        return postUserLogin(data);
    };

    return useMutation<AsyncReturnType<typeof postUserLogin>, TError, { data: UserLogin }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * User registration endpoint, returning authentication tokens.
 * @summary User registration
 */
export const postUserRegister = (userRegistration: UserRegistration) => {
    return customInstance<UserAuthResponse>({ url: `/user/register`, method: 'post', data: userRegistration });
};

export const usePostUserRegister = <
    TError = BadRequestResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postUserRegister>,
        TError,
        { data: UserRegistration },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postUserRegister>, { data: UserRegistration }> = (
        props,
    ) => {
        const { data } = props || {};

        return postUserRegister(data);
    };

    return useMutation<AsyncReturnType<typeof postUserRegister>, TError, { data: UserRegistration }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * User account deletion endpoint, delete a user by the id.
 * @summary Account deletion
 */
export const deleteUserId = (id: string) => {
    return customInstance<DeleteUserId200>({ url: `/user/${id}`, method: 'delete' });
};

export const useDeleteUserId = <
    TError = UnauthorizedResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof deleteUserId>, TError, { id: string }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof deleteUserId>, { id: string }> = (props) => {
        const { id } = props || {};

        return deleteUserId(id);
    };

    return useMutation<AsyncReturnType<typeof deleteUserId>, TError, { id: string }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * User account information endpoint, get user details by the id.
 * @summary Account information
 */
export const getUserId = (id: string) => {
    return customInstance<GetUserId200>({ url: `/user/${id}`, method: 'get' });
};

export const getGetUserIdQueryKey = (id: string) => [`/user/${id}`];

export const useGetUserId = <
    TData = AsyncReturnType<typeof getUserId>,
    TError = NotFoundResponse | InternalServerErrorResponse,
>(
    id: string,
    options?: { query?: UseQueryOptions<AsyncReturnType<typeof getUserId>, TError, TData> },
) => {
    const { query: queryOptions } = options || {};

    const queryKey = queryOptions?.queryKey ?? getGetUserIdQueryKey(id);
    const queryFn: QueryFunction<AsyncReturnType<typeof getUserId>> = () => getUserId(id);

    const query = useQuery<AsyncReturnType<typeof getUserId>, TError, TData>(queryKey, queryFn, {
        enabled: !!id,
        ...queryOptions,
    });

    return {
        queryKey,
        ...query,
    };
};

/**
 * Update user information endpoint, update user details for a user specified by the user id.
 * @summary Update account information
 */
export const patchUserId = (id: string) => {
    return customInstance<PatchUserId200>({ url: `/user/${id}`, method: 'patch', data: undefined });
};

export const usePatchUserId = <
    TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof patchUserId>, TError, { id: string }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof patchUserId>, { id: string }> = (props) => {
        const { id } = props || {};

        return patchUserId(id);
    };

    return useMutation<AsyncReturnType<typeof patchUserId>, TError, { id: string }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
