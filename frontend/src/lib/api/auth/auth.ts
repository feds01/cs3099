/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import {
  useMutation,
  UseMutationOptions,
  MutationFunction
} from 'react-query'
import type {
  UnprocessableEntityResponse,
  InternalServerErrorResponse,
  UsernameValidation,
  UserAuthResponseResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  TokenRequest,
  PostAuthSsoParams,
  UserLogin,
  UserRegistration
} from '.././models'
import { customInstance } from '.././mutator/custom-instance'

type AsyncReturnType<
T extends (...args: any) => Promise<any>
> = T extends (...args: any) => Promise<infer R> ? R : any;


/**
 * Check if an email is valid to use when registering
 * @summary Pre-registration username validation
 */
export const postAuthUsernamevalidation = (
    usernameValidation: UsernameValidation,
 ) => {
      return customInstance<void>(
      {url: `/auth/username_validation`, method: 'post',
      data: usernameValidation
    },
      );
    }
  


    export const usePostAuthUsernamevalidation = <TError = UnprocessableEntityResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postAuthUsernamevalidation>, TError,{data: UsernameValidation}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthUsernamevalidation>, {data: UsernameValidation}> = (props) => {
          const {data} = props || {};

          return  postAuthUsernamevalidation(data,)
        }

      return useMutation<AsyncReturnType<typeof postAuthUsernamevalidation>, TError, {data: UsernameValidation}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * Endpoint to refresh a JWT token
 * @summary Refresh user session
 */
export const postAuthSession = (
    tokenRequest: TokenRequest,
 ) => {
      return customInstance<UserAuthResponseResponse>(
      {url: `/auth/session`, method: 'post',
      data: tokenRequest
    },
      );
    }
  


    export const usePostAuthSession = <TError = BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postAuthSession>, TError,{data: TokenRequest}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthSession>, {data: TokenRequest}> = (props) => {
          const {data} = props || {};

          return  postAuthSession(data,)
        }

      return useMutation<AsyncReturnType<typeof postAuthSession>, TError, {data: TokenRequest}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * Make a request to the server with the selected external service in order to login with their external identity provider.
 * @summary Begin the SSO process.
 */
export const postAuthSso = (
    params?: PostAuthSsoParams,
 ) => {
      return customInstance<unknown>(
      {url: `/auth/sso`, method: 'post',
      data: undefined,
        params,
    },
      );
    }
  


    export const usePostAuthSso = <TError = void | BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postAuthSso>, TError,{params?: PostAuthSsoParams}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthSso>, {params?: PostAuthSsoParams}> = (props) => {
          const {params} = props || {};

          return  postAuthSso(params,)
        }

      return useMutation<AsyncReturnType<typeof postAuthSso>, TError, {params?: PostAuthSsoParams}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * User login endpoint, returning authentication tokens.
 * @summary User Login
 */
export const postAuthLogin = (
    userLogin: UserLogin,
 ) => {
      return customInstance<UserAuthResponseResponse>(
      {url: `/auth/login`, method: 'post',
      data: userLogin
    },
      );
    }
  


    export const usePostAuthLogin = <TError = BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postAuthLogin>, TError,{data: UserLogin}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthLogin>, {data: UserLogin}> = (props) => {
          const {data} = props || {};

          return  postAuthLogin(data,)
        }

      return useMutation<AsyncReturnType<typeof postAuthLogin>, TError, {data: UserLogin}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * User registration endpoint, returning authentication tokens.
 * @summary User registration
 */
export const postAuthRegister = (
    userRegistration: UserRegistration,
 ) => {
      return customInstance<UserAuthResponseResponse>(
      {url: `/auth/register`, method: 'post',
      data: userRegistration
    },
      );
    }
  


    export const usePostAuthRegister = <TError = BadRequestResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postAuthRegister>, TError,{data: UserRegistration}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postAuthRegister>, {data: UserRegistration}> = (props) => {
          const {data} = props || {};

          return  postAuthRegister(data,)
        }

      return useMutation<AsyncReturnType<typeof postAuthRegister>, TError, {data: UserRegistration}, TContext>(mutationFn, mutationOptions)
    }
    