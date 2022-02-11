import { ContentState } from '../types/requests';
import assert from 'assert';
import { UseMutationResult, UseQueryResult } from 'react-query';

/**
 * Function that applies a transformation between a react-query into a @see{ContentState}
 * type for convenience purposes.
 *
 * @param query - The Query that is to be transformed into a content state
 */
export function transformQueryIntoContentState<T, E>(query: UseQueryResult<T, E>): ContentState<T, E> {
    if (query.isError) {
        return { state: 'error', error: query.error };
    } else if (query.data && query.status === 'success') {
        // It cannot be that the data doesn't exist here as we have checked that it is neither
        // an error nor is loading, thus the data on the type must exist!
        assert.strict(query.data);
        return { state: 'ok', data: query.data };
    }

    return { state: 'loading' };
}

/**
 * Function that applies a transformation between a react-query into a @see{ContentState}
 * type for convenience purposes.
 *
 * @param query - The Query that is to be transformed into a content state
 */
export function transformMutationIntoContentState<T, E, V, Ctx>(
    query: UseMutationResult<T, E, V, Ctx>,
): ContentState<T, E> {
    if (query.isError) {
        return { state: 'error', error: query.error };
    } else if (query.data && query.status === 'success') {
        // It cannot be that the data doesn't exist here as we have checked that it is neither
        // an error nor is loading, thus the data on the type must exist!
        assert.strict(query.data);
        return { state: 'ok', data: query.data };
    }

    return { state: 'loading' };
}
