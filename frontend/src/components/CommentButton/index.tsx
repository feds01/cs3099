import Box from '@mui/material/Box/Box';
import { BiMessageAltAdd } from 'react-icons/bi';
import React, { ReactElement, useState } from 'react';
import CommentEditor from '../CommentEditor';
import { Review } from '../../lib/api/models';

import "react-mde/lib/styles/css/react-mde-all.css";

interface Props {
    filename: string;
    location: number;
    review: Review;
    children: React.ReactNode;
}

export default function CommentButton({ location, filename, review, children }: Props): ReactElement {
    const [display, setDisplay] = useState<boolean>(false);
    const [showEditor, setShowEditor] = useState<boolean>(false);

    return (
        <Box sx={{ position: 'relative' }} onMouseEnter={() => setDisplay(true)} onMouseLeave={() => setDisplay(false)}>
            <BiMessageAltAdd
                onClick={() => setShowEditor(true)}
                size={18}
                color={'blue'}
                style={{
                    top: '50%',
                    position: 'absolute',
                    // marginLeft: -16,
                    color: '#fff',
                    background: '#0076FF',
                    transform: 'translateY(-50%)',
                    display: display && !showEditor ? 'inline-flex' : 'none',
                    zIndex: 1000,
                }}
            />
            {children}
            {showEditor && (
                <CommentEditor
                    type="post"
                    filename={filename}
                    location={location}
                    reviewId={review.id}
                    onClose={() => setShowEditor(false)}
                />
            )}
        </Box>
    );
}
