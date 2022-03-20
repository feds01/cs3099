import Divider from '@mui/material/Divider';
import React, { Component, ErrorInfo } from 'react';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
    children: React.ReactNode;
}
interface State {
    hasError: boolean;
    errorString?: string;
    error?: Error;
}

export default class ErrorContainer extends Component<Props, State> {
    state = {
        hasError: false,
        errorString: '',
    };

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorString: '' };

        this.handleErrorEvent = this.handleErrorEvent.bind(this);
    }

    handleErrorEvent(event: ErrorEvent) {
        // ignore ResizeObserver loop limit exceeded
        // this is ok in several scenarios according to
        // https://github.com/WICG/resize-observer/issues/38
        if (event.message === 'Script error.' || event.message === 'ResizeObserver loop limit exceeded') {
            // @Cleanup
            return;
        }

        this.setState({
            hasError: true,
            errorString: btoa(event.error?.stack ? event.error.stack : JSON.stringify(event)),
        });
    }

    componentDidMount() {
        window.addEventListener('error', this.handleErrorEvent);
    }

    componentWillUnmount() {
        window.removeEventListener('error', this.handleErrorEvent);
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            errorString: btoa(error.stack ? error.stack : error.message),
        });
    }

    render() {
        const { errorString, hasError } = this.state;

        if (hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            margin: '2em',
                        }}
                    >
                        <Box
                            sx={{
                                m: 2,
                                userSelect: 'none',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <SentimentVeryDissatisfiedIcon style={{ fontSize: 40 }} />
                            <h1>Something went wrong!</h1>
                        </Box>
                        <h2>Please help out and email or send us this bug string.</h2>
                        <Divider />
                        <Typography sx={{ fontWeight: 'bold', wordBreak: 'break-all' }}>{errorString}</Typography>
                        <Divider />
                        <p>
                            Version: Iamus@{process.env.REACT_APP_VERSION}/{process.env.REACT_APP_DEV_VERSION} on branch{' '}
                            {process.env.REACT_APP_VERSION_BRANCH}
                            <br />
                        </p>
                    </div>
                </Box>
            );
        }

        return this.props.children;
    }
}
