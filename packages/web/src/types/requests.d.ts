type StateKind = 'loading' | 'ok' | 'error';

export type ContentState<T, E> = { state: 'loading' } | { state: 'ok'; data: T } | { state: 'error'; error: E };

/**
 * Function that will fold multiple content states into a single one. If the
 * left hand side content state is either 'error' or 'loading', the entire
 * array will be folded into the said state. Additionally, 'error' state
 * takes precedence over 'loading' state, and therefore will override any loading
 * state.
 *
 * If all states are 'ok', the entire state is folded to 'ok'.
 *
 * @param kinds - The states to fold.
 * @returns A single @see StateKind representing the set of all the states.
 */
export function foldContentStates(...kinds: StateKind[]): StateKind {
    return kinds.reduce((acc, current) =>
        acc === 'ok' ? current : acc === 'error' || current === 'error' ? 'error' : acc,
    );
}
