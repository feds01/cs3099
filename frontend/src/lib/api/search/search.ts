/**
 * Generated by orval v6.6.0 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import {
  useQuery,
  UseQueryOptions,
  QueryFunction,
  UseQueryResult,
  QueryKey
} from 'react-query'
import type {
  GetSearchPublication200,
  ApiErrorResponse,
  GetSearchPublicationParams,
  GetSearchUser200,
  GetSearchUserParams
} from '.././models'
import { customInstance } from '.././mutator/custom-instance'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncReturnType<
T extends (...args: any) => Promise<any>
> = T extends (...args: any) => Promise<infer R> ? R : any;


/**
 * Get a paginated list of publications from searching all available publications
 * @summary Search publications by specific keywords in a query.
 */
export const getSearchPublication = (
    params?: GetSearchPublicationParams,
 ) => {
      return customInstance<GetSearchPublication200>(
      {url: `/search/publication`, method: 'get',
        params,
    },
      );
    }
  

export const getGetSearchPublicationQueryKey = (params?: GetSearchPublicationParams,) => [`/search/publication`, ...(params ? [params]: [])];

    
export const useGetSearchPublication = <TData = AsyncReturnType<typeof getSearchPublication>, TError = ApiErrorResponse>(
 params?: GetSearchPublicationParams, options?: { query?:UseQueryOptions<AsyncReturnType<typeof getSearchPublication>, TError, TData>, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey } => {

  const {query: queryOptions} = options || {}

  const queryKey = queryOptions?.queryKey ?? getGetSearchPublicationQueryKey(params);

  

  const queryFn: QueryFunction<AsyncReturnType<typeof getSearchPublication>> = () => getSearchPublication(params, );

  const query = useQuery<AsyncReturnType<typeof getSearchPublication>, TError, TData>(queryKey, queryFn, queryOptions)

  return {
    queryKey,
    ...query
  }
}

/**
 * Get a paginated list of publications from searching all available publications
 * @summary Search publications by specific keywords in a query.
 */
export const getSearchUser = (
    params?: GetSearchUserParams,
 ) => {
      return customInstance<GetSearchUser200>(
      {url: `/search/user`, method: 'get',
        params,
    },
      );
    }
  

export const getGetSearchUserQueryKey = (params?: GetSearchUserParams,) => [`/search/user`, ...(params ? [params]: [])];

    
export const useGetSearchUser = <TData = AsyncReturnType<typeof getSearchUser>, TError = ApiErrorResponse>(
 params?: GetSearchUserParams, options?: { query?:UseQueryOptions<AsyncReturnType<typeof getSearchUser>, TError, TData>, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey } => {

  const {query: queryOptions} = options || {}

  const queryKey = queryOptions?.queryKey ?? getGetSearchUserQueryKey(params);

  

  const queryFn: QueryFunction<AsyncReturnType<typeof getSearchUser>> = () => getSearchUser(params, );

  const query = useQuery<AsyncReturnType<typeof getSearchUser>, TError, TData>(queryKey, queryFn, queryOptions)

  return {
    queryKey,
    ...query
  }
}

