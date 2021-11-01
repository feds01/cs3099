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
  UploadResourceResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  InternalServerErrorResponse,
  UploadResource
} from '.././models'
import { customInstance } from '.././mutator/custom-instance'

type AsyncReturnType<
T extends (...args: any) => Promise<any>
> = T extends (...args: any) => Promise<infer R> ? R : any;


/**
 * Endpoint for uploading media to Iamus from multiple sources including publications, comments, profile pictures, etc.
 * @summary Upload a generic file resource
 */
export const postResourceUploadPublicationId = (
    id: string,
    uploadResource: UploadResource,
 ) => {const formData = new FormData();
formData.append('file', uploadResource.file)

      return customInstance<unknown>(
      {url: `/resource/upload/publication/${id}`, method: 'post',
       data: formData
    },
      );
    }
  


    export const usePostResourceUploadPublicationId = <TError = UploadResourceResponse | BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postResourceUploadPublicationId>, TError,{id: string;data: UploadResource}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postResourceUploadPublicationId>, {id: string;data: UploadResource}> = (props) => {
          const {id,data} = props || {};

          return  postResourceUploadPublicationId(id,data,)
        }

      return useMutation<AsyncReturnType<typeof postResourceUploadPublicationId>, TError, {id: string;data: UploadResource}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * Endpoint for uploading media to Iamus from multiple sources including publications, comments, profile pictures, etc.
 * @summary Upload a generic file as an attachment to a comment
 */
export const postResourceUploadReviewId = (
    id: string,
    uploadResource: UploadResource,
 ) => {const formData = new FormData();
formData.append('file', uploadResource.file)

      return customInstance<unknown>(
      {url: `/resource/upload/review/${id}`, method: 'post',
       data: formData
    },
      );
    }
  


    export const usePostResourceUploadReviewId = <TError = UploadResourceResponse | BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postResourceUploadReviewId>, TError,{id: string;data: UploadResource}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postResourceUploadReviewId>, {id: string;data: UploadResource}> = (props) => {
          const {id,data} = props || {};

          return  postResourceUploadReviewId(id,data,)
        }

      return useMutation<AsyncReturnType<typeof postResourceUploadReviewId>, TError, {id: string;data: UploadResource}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * Endpoint for uploading media to Iamus for user profile pictures.
 * @summary Upload an avatar image for a user.
 */
export const postResourceUploadUsername = (
    username: string,
    uploadResource: UploadResource,
 ) => {const formData = new FormData();
formData.append('file', uploadResource.file)

      return customInstance<unknown>(
      {url: `/resource/upload/${username}`, method: 'post',
       data: formData
    },
      );
    }
  


    export const usePostResourceUploadUsername = <TError = UploadResourceResponse | BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postResourceUploadUsername>, TError,{username: string;data: UploadResource}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postResourceUploadUsername>, {username: string;data: UploadResource}> = (props) => {
          const {username,data} = props || {};

          return  postResourceUploadUsername(username,data,)
        }

      return useMutation<AsyncReturnType<typeof postResourceUploadUsername>, TError, {username: string;data: UploadResource}, TContext>(mutationFn, mutationOptions)
    }
    