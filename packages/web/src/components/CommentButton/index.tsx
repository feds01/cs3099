import { useDispatchSelection, useSelectionState } from '../../contexts/selection';
import { Review } from '../../lib/api/models';
import CommentEditor from '../CommentEditor';
import Box from '@mui/material/Box';
import React, { createRef, ReactElement, useState } from 'react';
import { BiMessageAltAdd } from 'react-icons/bi';
import 'react-mde/lib/styles/css/react-mde-all.css';

interface Props {
    filename: string;
    location: number;
    review: Review;
    children: React.ReactNode;
}

export default function CommentButton({ location, filename, review, children }: Props): ReactElement {
    const [display, setDisplay] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const selectionState = useSelectionState();
    const selectionDispatch = useDispatchSelection();

    const ref = createRef<HTMLSpanElement>();

    return (
        <Box
            sx={{ position: 'relative' }}
            onMouseEnter={() => setDisplay(true)}
            onMouseLeave={() => setDisplay(false)}
            onClick={(event) => {
                if (ref.current) {
                    const bound = ref.current.getBoundingClientRect();

                    if (
                        bound.left <= event.pageX &&
                        event.pageX <= bound.right &&
                        bound.top <= event.pageY &&
                        event.pageY <= bound.bottom
                    ) {
                        selectionDispatch({ type: 'set', location, filename });
                        setShowEditor(true);
                    }
                }
            }}
            onMouseUp={() => {
                if (selectionState.isDragging) {
                    selectionDispatch({ type: 'finalise', location });
                    setShowEditor(true);
                }
            }}
        >
            <span
                ref={ref}
                style={{
                    position: 'absolute',
                    transform: 'translateY(-50%)',
                    display: display && !showEditor ? 'inline-flex' : 'none',
                    zIndex: 1000,
                    height: 20,
                    width: 20,
                    top: '50%',
                }}
                onMouseDown={() => {
                    if (!showEditor) {
                        selectionDispatch({ type: 'begin', location, filename });
                    }
                }}
                onMouseEnter={() => {
                    if (selectionState.isDragging && location >= selectionState.range.start) {
                        selectionDispatch({ type: 'continue', location });
                    }
                }}
            >
                <BiMessageAltAdd
                    size={18}
                    color={'blue'}
                    style={{
                        color: '#fff',
                        background: '#0076FF',
                    }}
                />
            </span>
            {!showEditor &&
                selectionState.isDragging &&
                location >= selectionState.range.start &&
                location <= selectionState.range.end && (
                    <Box
                        sx={{
                            top: '50%',
                            position: 'absolute',
                            height: '20px',
                            width: '4px',
                            backgroundColor: '#0076FF',
                            ml: '10px',
                            transform: 'translateY(-50%)',
                            zIndex: 1001,
                        }}
                    />
                )}
            {children}
            {showEditor && (
                <CommentEditor
                    type="post"
                    filename={filename}
                    {...(typeof selectionState.range !== 'undefined' && { range: selectionState.range })}
                    reviewId={review.id}
                    onClose={() => {
                        setShowEditor(false);
                        selectionDispatch({ type: 'reset' });
                    }}
                />
            )}
        </Box>
    );
}
