export type ContentState<T, E> = { state: 'loading' } | { state: 'ok'; data: T } | { state: 'error'; error: E };
