import { Path, UseFormSetError } from 'react-hook-form';
import { ApiErrorResponseErrors } from '../api/models';

export function applyErrorsToForm<T>(errors: ApiErrorResponseErrors, setError: UseFormSetError<T>) {
    for (const [errorField, errorObject] of Object.entries(errors)) {
        // We don't support multiple error messages yet...
        if (typeof errorObject.message === 'string') {
            setError(errorField as Path<T>, {
                type: 'manual',
                message: errorObject.message,
            });
        }
    }
}
