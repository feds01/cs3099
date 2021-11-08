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
  MutationFunction
} from 'react-query'
import type {
  CreatePublicationResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  InternalServerErrorResponse,
  CreatePublicationRequest,
  DeletionResponseResponse,
  NotFoundResponse,
  GetPublicationUsernameName200,
  GetPublicationUsername200,
  GetPublicationUsernameParams,
  GetPublicationUsernameNameRevisions200,
  ResourceResponseResponse,
  GetPublicationUsernameNameRevision200
} from '.././models'
import { customInstance } from '.././mutator/custom-instance'

type AsyncReturnType<
T extends (...args: any) => Promise<any>
> = T extends (...args: any) => Promise<infer R> ? R : any;


/**
 * Create a new publication resource for a given user account.
 * @summary Create a publication
 */
export const postPublication = (
    createPublicationRequest: CreatePublicationRequest,
 ) => {
      return customInstance<unknown>(
      {url: `/publication`, method: 'post',
      data: createPublicationRequest
    },
      );
    }
  


    export const usePostPublication = <TError = CreatePublicationResponse | BadRequestResponse | UnauthorizedResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof postPublication>, TError,{data: CreatePublicationRequest}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof postPublication>, {data: CreatePublicationRequest}> = (props) => {
          const {data} = props || {};

          return  postPublication(data,)
        }

      return useMutation<AsyncReturnType<typeof postPublication>, TError, {data: CreatePublicationRequest}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * Create a new publication resource for a given user account.
 * @summary Delete a publication
 */
export const deletePublicationUsernameName = (
    username: string,
    name: string,
 ) => {
      return customInstance<DeletionResponseResponse>(
      {url: `/publication/${username}/${name}`, method: 'delete'
    },
      );
    }
  


    export const useDeletePublicationUsernameName = <TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof deletePublicationUsernameName>, TError,{username: string;name: string}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof deletePublicationUsernameName>, {username: string;name: string}> = (props) => {
          const {username,name} = props || {};

          return  deletePublicationUsernameName(username,name,)
        }

      return useMutation<AsyncReturnType<typeof deletePublicationUsernameName>, TError, {username: string;name: string}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * Get a publication resource for a given user account with the specified name. This will return the most recent publication revision.
 * @summary Get a publication
 */
export const getPublicationUsernameName = (
    username: string,
    name: string,
 ) => {
      return customInstance<GetPublicationUsernameName200>(
      {url: `/publication/${username}/${name}`, method: 'get'
    },
      );
    }
  

export const getGetPublicationUsernameNameQueryKey = (username: string,
    name: string,) => [`/publication/${username}/${name}`];

    
export const useGetPublicationUsernameName = <TData = AsyncReturnType<typeof getPublicationUsernameName>, TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse>(
 username: string,
    name: string, options?: { query?:UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameName>, TError, TData>, }

  ) => {

  const {query: queryOptions} = options || {}

  const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameNameQueryKey(username,name);
  const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameName>> = () => getPublicationUsernameName(username,name, );

  const query = useQuery<AsyncReturnType<typeof getPublicationUsernameName>, TError, TData>(queryKey, queryFn, {enabled: !!(username && name), ...queryOptions})

  return {
    queryKey,
    ...query
  }
}

/**
 * Get a list of publications that the user owns.
 * @summary Get a user's publications
 */
export const getPublicationUsername = (
    username: string,
    params?: GetPublicationUsernameParams,
 ) => {
      return customInstance<GetPublicationUsername200>(
      {url: `/publication/${username}`, method: 'get',
        params,
    },
      );
    }
  

export const getGetPublicationUsernameQueryKey = (username: string,
    params?: GetPublicationUsernameParams,) => [`/publication/${username}`, ...(params ? [params]: [])];

    
export const useGetPublicationUsername = <TData = AsyncReturnType<typeof getPublicationUsername>, TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse>(
 username: string,
    params?: GetPublicationUsernameParams, options?: { query?:UseQueryOptions<AsyncReturnType<typeof getPublicationUsername>, TError, TData>, }

  ) => {

  const {query: queryOptions} = options || {}

  const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameQueryKey(username,params);
  const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsername>> = () => getPublicationUsername(username,params, );

  const query = useQuery<AsyncReturnType<typeof getPublicationUsername>, TError, TData>(queryKey, queryFn, {enabled: !!(username), ...queryOptions})

  return {
    queryKey,
    ...query
  }
}

/**
 * Get a paginated list of publication revisions.
 * @summary Get a list of revisions for a publication
 */
export const getPublicationUsernameNameRevisions = (
    username: string,
    name: string,
 ) => {
      return customInstance<GetPublicationUsernameNameRevisions200>(
      {url: `/publication/${username}/${name}/revisions`, method: 'get'
    },
      );
    }
  

export const getGetPublicationUsernameNameRevisionsQueryKey = (username: string,
    name: string,) => [`/publication/${username}/${name}/revisions`];

    
export const useGetPublicationUsernameNameRevisions = <TData = AsyncReturnType<typeof getPublicationUsernameNameRevisions>, TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse>(
 username: string,
    name: string, options?: { query?:UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameNameRevisions>, TError, TData>, }

  ) => {

  const {query: queryOptions} = options || {}

  const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameNameRevisionsQueryKey(username,name);
  const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameNameRevisions>> = () => getPublicationUsernameNameRevisions(username,name, );

  const query = useQuery<AsyncReturnType<typeof getPublicationUsernameNameRevisions>, TError, TData>(queryKey, queryFn, {enabled: !!(username && name), ...queryOptions})

  return {
    queryKey,
    ...query
  }
}

/**
 * Get a publication resource file for a given user account with the specified name. This will return the most recent publication revision.
 * @summary Get a file from a publication
 */
export const getPublicationUsernameNameTreePath = (
    username: string,
    name: string,
    path: string,
 ) => {
      return customInstance<ResourceResponseResponse>(
      {url: `/publication/${username}/${name}/tree/${path}`, method: 'get'
    },
      );
    }
  

export const getGetPublicationUsernameNameTreePathQueryKey = (username: string,
    name: string,
    path: string,) => [`/publication/${username}/${name}/tree/${path}`];

    
export const useGetPublicationUsernameNameTreePath = <TData = AsyncReturnType<typeof getPublicationUsernameNameTreePath>, TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse>(
 username: string,
    name: string,
    path: string, options?: { query?:UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameNameTreePath>, TError, TData>, }

  ) => {

  const {query: queryOptions} = options || {}

  const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameNameTreePathQueryKey(username,name,path);
  const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameNameTreePath>> = () => getPublicationUsernameNameTreePath(username,name,path, );

  const query = useQuery<AsyncReturnType<typeof getPublicationUsernameNameTreePath>, TError, TData>(queryKey, queryFn, {enabled: !!(username && name && path), ...queryOptions})

  return {
    queryKey,
    ...query
  }
}

/**
 * Create a new publication resource for a given user account.
 * @summary Delete a specific revision of a publication
 */
export const deletePublicationUsernameNameRevision = (
    username: string,
    name: string,
    revision: string,
 ) => {
      return customInstance<DeletionResponseResponse>(
      {url: `/publication/${username}/${name}/${revision}`, method: 'delete'
    },
      );
    }
  


    export const useDeletePublicationUsernameNameRevision = <TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse,
    
    TContext = unknown>(options?: { mutation?:UseMutationOptions<AsyncReturnType<typeof deletePublicationUsernameNameRevision>, TError,{username: string;name: string;revision: string}, TContext>, }
) => {
      const {mutation: mutationOptions} = options || {}

      const mutationFn: MutationFunction<AsyncReturnType<typeof deletePublicationUsernameNameRevision>, {username: string;name: string;revision: string}> = (props) => {
          const {username,name,revision} = props || {};

          return  deletePublicationUsernameNameRevision(username,name,revision,)
        }

      return useMutation<AsyncReturnType<typeof deletePublicationUsernameNameRevision>, TError, {username: string;name: string;revision: string}, TContext>(mutationFn, mutationOptions)
    }
    /**
 * Get a publication resource for a given user account with the specified name and the particular revision.
 * @summary Get a specific revision of a publication
 */
export const getPublicationUsernameNameRevision = (
    username: string,
    name: string,
    revision: string,
 ) => {
      return customInstance<GetPublicationUsernameNameRevision200>(
      {url: `/publication/${username}/${name}/${revision}`, method: 'get'
    },
      );
    }
  

export const getGetPublicationUsernameNameRevisionQueryKey = (username: string,
    name: string,
    revision: string,) => [`/publication/${username}/${name}/${revision}`];

    
export const useGetPublicationUsernameNameRevision = <TData = AsyncReturnType<typeof getPublicationUsernameNameRevision>, TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse>(
 username: string,
    name: string,
    revision: string, options?: { query?:UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameNameRevision>, TError, TData>, }

  ) => {

  const {query: queryOptions} = options || {}

  const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameNameRevisionQueryKey(username,name,revision);
  const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameNameRevision>> = () => getPublicationUsernameNameRevision(username,name,revision, );

  const query = useQuery<AsyncReturnType<typeof getPublicationUsernameNameRevision>, TError, TData>(queryKey, queryFn, {enabled: !!(username && name && revision), ...queryOptions})

  return {
    queryKey,
    ...query
  }
}

/**
 * Get a publication resource file for a given user account with the specified name and the particular revision.
 * @summary Get a file from a publication
 */
export const getPublicationUsernameNameRevisionTreePath = (
    username: string,
    name: string,
    revision: string,
    path: string,
 ) => {
      return customInstance<ResourceResponseResponse>(
      {url: `/publication/${username}/${name}/${revision}/tree/${path}`, method: 'get'
    },
      );
    }
  

export const getGetPublicationUsernameNameRevisionTreePathQueryKey = (username: string,
    name: string,
    revision: string,
    path: string,) => [`/publication/${username}/${name}/${revision}/tree/${path}`];

    
export const useGetPublicationUsernameNameRevisionTreePath = <TData = AsyncReturnType<typeof getPublicationUsernameNameRevisionTreePath>, TError = BadRequestResponse | UnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse>(
 username: string,
    name: string,
    revision: string,
    path: string, options?: { query?:UseQueryOptions<AsyncReturnType<typeof getPublicationUsernameNameRevisionTreePath>, TError, TData>, }

  ) => {

  const {query: queryOptions} = options || {}

  const queryKey = queryOptions?.queryKey ?? getGetPublicationUsernameNameRevisionTreePathQueryKey(username,name,revision,path);
  const queryFn: QueryFunction<AsyncReturnType<typeof getPublicationUsernameNameRevisionTreePath>> = () => getPublicationUsernameNameRevisionTreePath(username,name,revision,path, );

  const query = useQuery<AsyncReturnType<typeof getPublicationUsernameNameRevisionTreePath>, TError, TData>(queryKey, queryFn, {enabled: !!(username && name && revision && path), ...queryOptions})

  return {
    queryKey,
    ...query
  }
}
