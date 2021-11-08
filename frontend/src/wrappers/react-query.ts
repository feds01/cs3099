import assert from 'assert';
import { UseQueryResult } from 'react-query';
import { ContentState } from '../types/requests';

/**
 * Function that applies a transformation between a react-query into a @see{ContentState}
 * type for convenience purposes.
 *
 * @param query - The Query that is to be transformed into a content state
 */
export function transformQueryIntoContentState<T, E>(query: UseQueryResult<T, E>): ContentState<T, E | null> {
    if (query.isLoading) {
        return { state: 'loading' };
    }

    if (query.isError) {
        return { state: 'error', error: query.error };
    } else if (query.data && query.status === 'success') {
        // It cannot be that the data doesn't exist here as we have checked that it is neither
        // an error nor is loading, thus the data on the type must exist!
        assert.strict(query.data);
        return { state: 'ok', data: query.data };
    }

    // How?
    return { state: 'error', error: query.error };
}