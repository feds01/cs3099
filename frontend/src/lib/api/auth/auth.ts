/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import { useMutation, UseMutationOptions, MutationFunction } from 'react-query';
import type {
    UnprocessableEntityResponse,
    InternalServerErrorResponse,
    EmailValidation,
    UserAuthResponse,
    BadRequestResponse,
    UnauthorizedResponse,
    UserLogin,
    UserRegistration,
    TokenResponse,
    TokenRequest,
    UsernameValidation,
} from '.././models';
import { customInstance } from '.././mutator/custom-instance';

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * Check if an email is valid to use when registering
 * @summary Pre-registration email validation
 */
export const postAuthEmailvalidation = (emailValidation: EmailValidation) => {
    return customInstance<void>({ url: `/auth/email_validation`, method: 'post', data: emailValidation });
};

export const usePostAuthEmailvalidation = <
    TError = UnprocessableEntityResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postAuthEmailvalidation>,
        TError,
        { data: EmailValidation },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthEmailvalidation>, { data: EmailValidation }> = (
        props,
    ) => {
        const { data } = props || {};

        return postAuthEmailvalidation(data);
    };

    return useMutation<AsyncReturnType<typeof postAuthEmailvalidation>, TError, { data: EmailValidation }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * User login endpoint, returning authentication tokens.
 * @summary User Login
 */
export const postAuthLogin = (userLogin: UserLogin) => {
    return customInstance<UserAuthResponse>({ url: `/auth/login`, method: 'post', data: userLogin });
};

export const usePostAuthLogin = <
    TError = BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof postAuthLogin>, TError, { data: UserLogin }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthLogin>, { data: UserLogin }> = (props) => {
        const { data } = props || {};

        return postAuthLogin(data);
    };

    return useMutation<AsyncReturnType<typeof postAuthLogin>, TError, { data: UserLogin }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * User registration endpoint, returning authentication tokens.
 * @summary User registration
 */
export const postAuthRegister = (userRegistration: UserRegistration) => {
    return customInstance<UserAuthResponse>({ url: `/auth/register`, method: 'post', data: userRegistration });
};

export const usePostAuthRegister = <
    TError = BadRequestResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postAuthRegister>,
        TError,
        { data: UserRegistration },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthRegister>, { data: UserRegistration }> = (
        props,
    ) => {
        const { data } = props || {};

        return postAuthRegister(data);
    };

    return useMutation<AsyncReturnType<typeof postAuthRegister>, TError, { data: UserRegistration }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * Endpoint to refresh a JWT token
 * @summary Refresh user session
 */
export const postAuthToken = (tokenRequest: TokenRequest) => {
    return customInstance<TokenResponse>({ url: `/auth/token`, method: 'post', data: tokenRequest });
};

export const usePostAuthToken = <
    TError = BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<AsyncReturnType<typeof postAuthToken>, TError, { data: TokenRequest }, TContext>;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthToken>, { data: TokenRequest }> = (props) => {
        const { data } = props || {};

        return postAuthToken(data);
    };

    return useMutation<AsyncReturnType<typeof postAuthToken>, TError, { data: TokenRequest }, TContext>(
        mutationFn,
        mutationOptions,
    );
};
/**
 * Check if an email is valid to use when registering
 * @summary Pre-registration username validation
 */
export const postAuthUsernamevalidation = (usernameValidation: UsernameValidation) => {
    return customInstance<void>({ url: `/auth/username_validation`, method: 'post', data: usernameValidation });
};

export const usePostAuthUsernamevalidation = <
    TError = UnprocessableEntityResponse | InternalServerErrorResponse,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        AsyncReturnType<typeof postAuthUsernamevalidation>,
        TError,
        { data: UsernameValidation },
        TContext
    >;
}) => {
    const { mutation: mutationOptions } = options || {};

    const mutationFn: MutationFunction<
        AsyncReturnType<typeof postAuthUsernamevalidation>,
        { data: UsernameValidation }
    > = (props) => {
        const { data } = props || {};

        return postAuthUsernamevalidation(data);
    };

    return useMutation<
        AsyncReturnType<typeof postAuthUsernamevalidation>,
        TError,
        { data: UsernameValidation },
        TContext
    >(mutationFn, mutationOptions);
};