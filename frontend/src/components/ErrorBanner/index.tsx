import { ReactElement } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

interface Props {
    message: string
}

export default function ErrorBanner({message}: Props): ReactElement {
    return (
        <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {message}
        </Alert>
    );
}
