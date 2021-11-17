import ReactMde from 'react-mde';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import React, { ReactElement, useState } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';

interface Props {
    filename: string;
    location: number;
    reviewId: string;
    onClose: () => void;
}

// TODO: in the future, add support for images
// TODO: we can also use the suggestion for usernames.

// https://codesandbox.io/s/react-mde-latest-forked-f9ti5?file=/src/index.js
export default function CommentEditor({ filename, onClose, location }: Props): ReactElement {
    const [value, setValue] = useState<string>('');
    const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');

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
                <Button variant="outlined" sx={{mr: 1}} onClick={onClose}>Cancel</Button>
                <Button>Submit</Button>
            </Box>
        </Box>
    );
}
