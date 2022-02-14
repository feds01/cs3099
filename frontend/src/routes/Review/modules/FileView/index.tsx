import ErrorBanner from '../../../../components/ErrorBanner';
import { useNotificationDispatch } from '../../../../hooks/notification';
import { useReviewDispatch, useReviewState } from '../../../../hooks/review';
import { ApiErrorResponse, GetPublicationUsernameNameAll200 } from '../../../../lib/api/models';
import { useGetPublicationUsernameNameAll } from '../../../../lib/api/publications/publications';
import { usePostReviewIdComplete } from '../../../../lib/api/reviews/reviews';
import { ContentState } from '../../../../types/requests';
import { transformQueryIntoContentState } from '../../../../wrappers/react-query';
import SourceList from './SourceList';
import SubmissionPopOver from './SubmissionPopOver';
import TreeView from './TreeView';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { ReactElement, useEffect, useState } from 'react';

export default function ReviewEditor(): ReactElement {
    const {
        review: { publication, status, id },
    } = useReviewState();
    const { refetch } = useReviewDispatch();

    const notificationDispatcher = useNotificationDispatch();
    const fileQuery = useGetPublicationUsernameNameAll(publication.owner.username, publication.name, {
        revision: publication.revision,
    });

    const completeReviewQuery = usePostReviewIdComplete();

    const [resourceResponse, setResourceResponse] = useState<
        ContentState<GetPublicationUsernameNameAll200, ApiErrorResponse>
    >({
        state: 'loading',
    });

    useEffect(() => {
        setResourceResponse(transformQueryIntoContentState(fileQuery));
    }, [fileQuery.data, fileQuery.isLoading]);

    useEffect(() => {
        if (!completeReviewQuery.isLoading && completeReviewQuery.data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully posted review' },
            });

            refetch();
        } else if (completeReviewQuery.isError && completeReviewQuery.error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: 'Failed to complete review' },
            });
        }
    }, [completeReviewQuery.isLoading, completeReviewQuery.data]);

    // For the submit pop-over so a reviewer can leave a general comment on a review...
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    switch (resourceResponse.state) {
        case 'loading': {
            return <LinearProgress />;
        }
        case 'error': {
            return <ErrorBanner message={resourceResponse.error.message} />;
        }
        case 'ok': {
            const { entries } = resourceResponse.data;
            return (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            minWidth: 800,
                            flexDirection: 'row',
                            minHeight: '100%',
                            overflowX: 'hidden',
                            width: 'calc(100vw - 41px)',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '30%',
                                maxWidth: 300,
                                position: 'fixed',
                                height: '100%',
                                borderRight: 1,
                                flex: 1,
                                zIndex: 80,
                                borderColor: 'divider',
                                overflowY: 'scroll',
                                overflowX: 'scroll',
                                ...(status === 'started' && { height: 'calc(100% - 172px)' }),
                            }}
                        >
                            <TreeView paths={entries.map((entry) => entry.filename)} />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                pl: 'min(30%, 300px)',
                                position: 'relative',
                                width: 'calc(100% - min(30%, 300px))',
                                flexDirection: 'column',
                                flex: 1,
                                overflowY: 'scroll',
                                overflowX: 'hidden',
                                mr: 1,
                                ml: 1,
                                ...(status === 'started' && { pb: '60px' }),
                            }}
                        >
                            <SourceList entries={entries} />
                        </Box>
                    </Box>
                    {status === 'started' && (
                        <Box
                            sx={{
                                display: 'flex',
                                position: 'fixed',
                                flexDirection: 'row',
                                border: 1,
                                borderLeft: 0,
                                height: 60,
                                borderColor: 'divider',
                                justifyContent: 'space-between',
                                background: '#fff',
                                width: 'calc(100% - 41px)', // @@Hack: we assume that the side bar size is always constant
                                bottom: 0,
                                zIndex: 100,
                            }}
                        >
                            <div></div>
                            <Box sx={{ p: 2 }}>
                                <LoadingButton
                                    variant="contained"
                                    loading={completeReviewQuery.isLoading}
                                    onClick={handleClick}
                                    endIcon={<ArrowDropUpIcon />}
                                >
                                    Finish review
                                </LoadingButton>
                            </Box>
                        </Box>
                    )}
                    <SubmissionPopOver
                        open={open}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                        onSubmission={() => {
                            setAnchorEl(null);
                            completeReviewQuery.mutateAsync({ id });
                        }}
                    />
                </>
            );
        }
    }
}
