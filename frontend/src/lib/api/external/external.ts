/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import { useMutation, UseMutationOptions, MutationFunction } from 'react-query';
import type {
    InternalServerErrorResponse,
    PostSgSsoCallbackParams,
    UserAuthResponse,
    BadRequestResponse,
    UnauthorizedResponse,
    UserLogin,
    PostSgSsoLoginParams,
    TokenVerificationResponse,
    PostSgSsoVerifyParams,
} from '.././models';
import { customInstance } from '.././mutator/custom-instance';

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * This endpoint is used to notify the journal that the external login was successful and we should proceed with authenticating the external user. This might mean that there is an internal process of registering the user on the platofrm.
 * @summary Successful external login endpoint.
 */
export const postSgSsoCallback = (params?: PostSgSsoCallbackParams) => {
    return customInstance<void>({ url: `/sg/sso/callback`, method: 'post', data: undefined, params });
};

export const usePostSgSsoCallback = <TError = InternalServerErrorResponse, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postSgSsoCallback>,
        TError,
        { params?: PostSgSsoCallbackParams },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof postSgSsoCallback>,
        { params?: PostSgSsoCallbackParams }
    > = (props) => {
        const { params } = props || {};

        return postSgSsoCallback(params);
    };

    return useMutation<
        AsyncReturnType<typeof postSgSsoCallback>,
        TError,
        { params?: PostSgSsoCallbackParams },
        TContext
    >(mutationFn, mutationOptions);
};
/**
 * Endpoint for external services to authenticate with this service.
 * @summary External login endpoint
 */
export const postSgSsoLogin = (userLogin: UserLogin, params?: PostSgSsoLoginParams) => {
    return customInstance<UserAuthResponse>({ url: `/sg/sso/login`, method: 'post', data: userLogin, params });
};

export const usePostSgSsoLogin = <
    TError = BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postSgSsoLogin>,
        TError,
        { data: UserLogin; params?: PostSgSsoLoginParams },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof postSgSsoLogin>,
        { data: UserLogin; params?: PostSgSsoLoginParams }
    > = (props) => {
        const { data, params } = props || {};

        return postSgSsoLogin(data, params);
    };

    return useMutation<
        AsyncReturnType<typeof postSgSsoLogin>,
        TError,
        { data: UserLogin; params?: PostSgSsoLoginParams },
        TContext
    >(mutationFn, mutationOptions);
};
/**
 * Endpoint to refresh a JWT token
 * @summary Refresh user session
 */
export const postSgSsoVerify = (params?: PostSgSsoVerifyParams) => {
    return customInstance<TokenVerificationResponse>({
        url: `/sg/sso/verify`,
        method: 'post',
        data: undefined,
        params,
    });
};

export const usePostSgSsoVerify = <TError = unknown, TContext = unknown>(options?: {
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
