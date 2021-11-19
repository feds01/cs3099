import ReactMde from 'react-mde';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MarkdownRenderer from '../MarkdownRenderer';
import { useReviewDispatch } from '../../hooks/review';
import { ReactElement, useEffect, useState } from 'react';
import { usePutReviewIdComment } from '../../lib/api/reviews/reviews';
import { useNotificationDispatch } from '../../hooks/notification';
import CircularProgress from '@mui/material/CircularProgress';

interface Props {
    filename: string;
    location: number;
    reviewId: string;
    onClose: () => void;
}

// TODO: in the future, add support for images
// TODO: we can also use the suggestion for usernames.

// https://codesandbox.io/s/react-mde-latest-forked-f9ti5?file=/src/index.js
export default function CommentEditor({ reviewId, filename, onClose, location }: Props): ReactElement {
    const { refetch } = useReviewDispatch();
    const notificationDispatcher = useNotificationDispatch();

    const [value, setValue] = useState<string>('');
    const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');

    const { isLoading, data, error, isError, mutateAsync } = usePutReviewIdComment();

    useEffect(() => {
        if (!isLoading && data) {
            refetch();

            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully posted comment' },
            });
            onClose();
        } else if (isError && error) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'error', message: 'Failed to post comment' },
            });
        }
    }, [data, isLoading]);

    const onSubmit = async () =>
        await mutateAsync({
            id: reviewId,
            data: { filename, anchor: { start: location + 1, end: location + 2 }, contents: value },
        });

    return (
        <Box>
            <ReactMde
                value={value}
                onChange={setValue}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) => Promise.resolve(<MarkdownRenderer contents={markdown} />)}
                childProps={{
                    writeButton: {
                        tabIndex: -1,
                    },
                }}
            />
            <Box sx={{ pt: 1, pb: 1 }}>
                <Button variant="outlined" sx={{ mr: 1 }} onClick={onClose}>
                    Cancel
                </Button>
                <Button disabled={isLoading} onClick={onSubmit}>
                    {!isLoading ? 'Submit' : <CircularProgress variant="determinate" color="inherit" size={14} />}
                </Button>
            </Box>
        </Box>
    );
}
