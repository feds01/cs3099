import { ReactElement } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { ApiErrorResponseErrors } from '../../lib/api/models/apiErrorResponseErrors';

interface Props {
    message: string;
    errors?: ApiErrorResponseErrors;
}

export default function ErrorBanner({ message, errors }: Props): ReactElement {
    return (
        <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            <strong>{message}</strong>
            {typeof errors !== 'undefined' && Object.keys(errors).length > 0 && (
                <ul>
                    {Object.entries(errors).map(([key, value]) => {
                        return (
                            <li>
                                <strong>{key}</strong>: {value.message}
                            </li>
                        );
                    })}
                </ul>
            )}
        </Alert>
    );
}
