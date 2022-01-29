import Box from '@mui/material/Box/Box';
import CodeRenderer from '../CodeRenderer';
import CommentCard from '../CommentCard';
import sortedIndexBy from 'lodash/sortedIndexBy';
import CommentEditor from '../CommentEditor';
import { Review, Comment } from '../../lib/api/models';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { useState, useEffect, useRef } from 'react';
import { BoxProps, Button, IconButton, Menu, MenuItem, Skeleton } from '@mui/material';

import { styled } from '@mui/material/styles';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';

// This is used to represent the default maximum size of source files that are
// rendered without the user explicitly asking them to be rendered.
const DEFAULT_SOURCE_FILE_LIMIT = 500;

function shouldRenderByDefault(contents: string): boolean {
    return contents.split(/\r\n|\r|\n/).length < DEFAULT_SOURCE_FILE_LIMIT;
}

/**
 * This is a component used to display a file that won't be automatically loaded due to it's large size.
 *
 * @param props - Any props that are passed to the Box component that surrounds the inner body.
 */
const FileSkeleton = (props: BoxProps) => {
    return (
        <Box {...props}>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}>
                <Skeleton animation={false} width={80} sx={{ mr: 1 }}>
                    <Typography>.</Typography>
                </Skeleton>
                <Skeleton animation={false} width={97}>
                    <Typography>.</Typography>
                </Skeleton>
            </Box>
            <Skeleton animation={false} width={140}>
                <Typography>.</Typography>
            </Skeleton>
            <Skeleton animation={false} width={97}>
                <Typography>.</Typography>
            </Skeleton>
        </Box>
    );
};

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
    <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
    // backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
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
    id?: string;
    language?: string;
    review: Review;
    comments?: Comment[];
};

export default function FileViewer({ contents, filename, id, review, comments, language }: FileViewerProps) {
    const [expanded, setExpanded] = useState<boolean>(true);
    const [renderSources, setRenderSources] = useState<boolean>(shouldRenderByDefault(contents));

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

    const [commentMap, setCommentMap] = useState<Map<number, Comment[]>>(new Map([]));
    const [fileComments, setFileComments] = useState<Comment[]>();

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
        if (renderSources && typeof comments !== 'undefined') {
            const newMap = new Map<number, Comment[]>();
            const collectedFileComments: Comment[] = [];

            // TODO: support anchors...
            comments.forEach((comment) => {
                // Essentially, if no anchor is present on the comment, we put it on the file comments
                if (typeof comment.anchor === 'undefined') {
                    collectedFileComments.push(comment);
                } else {
                    const start = comment.anchor.start;

                    if (newMap.has(start)) {
                        let originalArr = newMap.get(start)!;
                        let insertionIndex = sortedIndexBy(originalArr, comment, (c) => c.updatedAt);

                        // Safety: We mutate the original array so it should still live in the map.
                        originalArr.splice(insertionIndex, 0, comment);
                    } else {
                        newMap.set(comment.anchor.start, [comment]);
                    }
                }
            });

            setCommentMap(newMap);
            setFileComments(collectedFileComments);
        }
    }, [comments, renderSources]);

    return (
        <>
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Typography {...(typeof id !== 'undefined' && { id })}>{filename}</Typography>
                        <IconButton
                            aria-label="file-settings"
                            disabled={!renderSources}
                            onClick={handleClick}
                            aria-expanded={isOpen ? 'true' : undefined}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {renderSources ? (
                        <CodeRenderer contents={contents} filename={filename} commentMap={commentMap} review={review} />
                    ) : (
                        <>
                            <FileSkeleton sx={{ p: 1, zIndex: 10, width: '100%' }} />
                            <Box
                                sx={{
                                    p: 2,
                                    zIndex: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                }}
                            >
                                <Button
                                    variant="contained"
                                    sx={{ fontWeight: 'bold' }}
                                    size={'small'}
                                    color="primary"
                                    onClick={() => {
                                        setRenderSources(true);
                                    }}
                                >
                                    Load file
                                </Button>
                                <Typography variant={'body1'}>Large files aren't rendered by default</Typography>
                            </Box>
                        </>
                    )}
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
                fileComments?.map((comment) => {
                    return (
                        <Box key={comment.contents} sx={{ pt: 1, pb: 1 }}>
                            <CommentCard review={review} comment={comment} />
                        </Box>
                    );
                })}
            {typeof review !== 'undefined' && editingComment && (
                <div ref={editCommentRef}>
                    <CommentEditor
                        isModifying={false}
                        filename={filename}
                        reviewId={review.id}
                        onClose={() => setEditingComment(false)}
                    />
                </div>
            )}
        </>
    );
}
