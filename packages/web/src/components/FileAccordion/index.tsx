import Box from '@mui/material/Box/Box';
import CommentEditor from '../CommentEditor';
import { Review } from '../../lib/api/models';
import Typography from '@mui/material/Typography';
import { MdMoreVert, MdArrowForwardIos } from 'react-icons/md';
import React, { useState, useEffect, useRef } from 'react';
import CommentThreadRenderer from '../CommentThreadRenderer';
import { IconButton, Menu, MenuItem } from '@mui/material';

import { styled } from '@mui/material/styles';
import { CommentThread } from '../../lib/utils/comment';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import FileView from '../FileViewer';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
    ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
    }),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary expandIcon={<MdArrowForwardIos style={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

type FileViewerProps = {
    contents: string;
    filename: string;
    mimeType: string;
    id?: string;
    review: Review;
    threads?: CommentThread[];
    worker?: Worker;
};

export default function FileViewer({ contents, filename, mimeType, id, review, threads, worker }: FileViewerProps) {
    const [expanded, setExpanded] = useState<boolean>(true);
    const [editingComment, setEditingComment] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [commentMap, setCommentMap] = useState<Map<number, CommentThread[]>>(new Map([]));
    const [fileComments, setFileComments] = useState<CommentThread[]>();

    const editCommentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingComment) {
            /// We need to scroll to the end of the file so the user can start editing the file
            /// comment...
            editCommentRef.current?.scrollIntoView({
                block: 'end',
            });
        }
    }, [editingComment]);

    const handleEditComment = () => {
        setEditingComment(true);
        handleClose();
    };

    // Let's compute where the comments are to be placed once once we get them
    useEffect(() => {
        if (typeof threads !== 'undefined') {
            const newMap = new Map<number, CommentThread[]>();
            const collectedFileComments: CommentThread[] = [];

            threads.forEach((thread) => {
                // Essentially, if no anchor is present on the comment, we put it on the file comments
                if (typeof thread.anchor === 'undefined') {
                    collectedFileComments.push(thread);
                } else {
                    const insertionIndex = thread.anchor.end - 1;

                    if (newMap.has(insertionIndex)) {
                        let originalArr = newMap.get(insertionIndex)!;
                        originalArr.push(thread);
                    } else {
                        newMap.set(insertionIndex, [thread]);
                    }
                }
            });

            setCommentMap(newMap);
            setFileComments(collectedFileComments);
        }
    }, [threads]);

    return (
        <>
            <Accordion
                expanded={expanded}
                onChange={() => setExpanded(!expanded)}
                sx={{
                    borderRadius: '6px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                }}
            >
                <AccordionSummary>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography {...(typeof id !== 'undefined' && { id })}>{filename}</Typography>
                        <IconButton
                            aria-label="file-settings"
                            onClick={handleClick}
                            aria-expanded={isOpen ? 'true' : undefined}
                        >
                            <MdMoreVert />
                        </IconButton>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <FileView
                        commentMap={commentMap}
                        review={review}
                        worker={worker}
                        publicationIndex={{
                            username: review.publication.owner.username,
                            name: review.publication.name,
                            revision: review.publication.revision,
                        }}
                        renderLargeFiles={false}
                        contents={contents}
                        mimeType={mimeType}
                        filename={filename}
                    />
                </AccordionDetails>
                <Menu
                    id="comment-settings"
                    MenuListProps={{
                        'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl}
                    open={isOpen}
                    onClose={handleClose}
                >
                    <MenuItem disabled={editingComment} onClick={handleEditComment} disableRipple>
                        Add comment
                    </MenuItem>
                </Menu>
            </Accordion>
            {typeof review !== 'undefined' &&
                fileComments?.map((thread) => {
                    return (
                        <Box key={thread.id} sx={{ pt: 1, pb: 1 }}>
                            <CommentThreadRenderer thread={thread} />
                        </Box>
                    );
                })}
            {typeof review !== 'undefined' && editingComment && (
                <div ref={editCommentRef}>
                    <CommentEditor
                        type="post"
                        filename={filename}
                        reviewId={review.id}
                        onClose={() => setEditingComment(false)}
                    />
                </div>
            )}
        </>
    );
}
