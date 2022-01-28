import React, { useRef } from 'react';
import Prism from 'prismjs';
import Box from '@mui/material/Box/Box';
import CommentCard from '../CommentCard';
import CommentButton from '../CommentButton';
import sortedIndexBy from 'lodash/sortedIndexBy';
import CommentEditor from '../CommentEditor';
import { Review, Comment } from '../../lib/api/models';
import theme from 'prism-react-renderer/themes/github';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ReactElement, useEffect, useState } from 'react';
import { coerceExtensionToLanguage, getExtension } from '../../lib/utils/file';
import Highlight, { Language, Prism as PrismRR } from 'prism-react-renderer';
import { BoxProps, Button, IconButton, Menu, MenuItem, Skeleton, styled, Typography } from '@mui/material';

// We have to essentially pre-load all of the languages
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-v';
import 'prismjs/components/prism-json';

// This is used to represent the default maximum size of source files that are
// rendered without the user explicitly asking them to be rendered.
const DEFAULT_SOURCE_FILE_LIMIT = 500;

function shouldRenderByDefault(contents: string): boolean {
    return contents.split(/\r\n|\r|\n/).length < DEFAULT_SOURCE_FILE_LIMIT;
}

type PrismLib = typeof PrismRR & typeof Prism;

export const Wrapper = styled('div')`
    font-family: sans-serif;
    text-align: center;
`;

export const Pre = styled('pre')`
    text-align: left;
    margin: 1em 0;
    padding: 0.5em;
    overflow: scroll;

    & .token-line {
        line-height: 1.3em;
        height: 1.3em;
    }
`;

export const Line = styled('div')`
    display: table-row;
`;

export const LineNo = styled('span')`
    display: table-cell;
    text-align: right;
    padding-right: 1em;
    user-select: none;
    opacity: 0.5;
`;

export const LineContent = styled('span')`
    display: table-cell;
`;

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

interface CodeRendererProps {
    contents: string;
    filename: string;
    id?: string;
    language?: string;
    titleBar?: boolean;
    review?: Review;
    comments?: Comment[];
    forceRender?: boolean;
}

export default function CodeRenderer({
    contents,
    titleBar = false,
    filename,
    id,
    review,
    comments,
    language,
    forceRender = false,
}: CodeRendererProps): ReactElement {
    const extension = coerceExtensionToLanguage(getExtension(filename) ?? '');

    const [renderSources, setRenderSources] = useState<boolean>(forceRender || shouldRenderByDefault(contents));
    const [editingComment, setEditingComment] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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

    const [commentMap, setCommentMap] = useState<Map<number, Comment[]>>(new Map([]));
    const [fileComments, setFileComments] = useState<Comment[]>();

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
        <Box sx={{ p: 2 }}>
            {titleBar && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        border: 1,
                        borderColor: 'divider',
                        justifyContent: 'space-between',
                        pt: 2,
                        pb: 2,
                        pl: 1,
                        pr: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                        <Typography
                            {...(typeof id !== 'undefined' && { id })}
                            sx={{ fontWeight: 'bold' }}
                            variant={'body1'}
                        >
                            {filename}
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="file-settings"
                        disabled={!renderSources}
                        onClick={handleClick}
                        aria-expanded={isOpen ? 'true' : undefined}
                    >
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            )}
            <Box sx={{ border: '1px solid', borderTop: titleBar ? 0 : 1, borderColor: (t) => t.palette.divider }}>
                {renderSources ? (
                    <Highlight
                        Prism={Prism as PrismLib}
                        theme={theme}
                        code={contents}
                        language={extension as unknown as Language} // @@Hack: this fucking library defined their own lang types..
                    >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                            <Pre className={className} style={style}>
                                {tokens.map((line, i) =>
                                    typeof review !== 'undefined' ? (
                                        <React.Fragment key={i}>
                                            <CommentButton review={review} location={i} filename={filename}>
                                                <Line {...getLineProps({ line, key: i })}>
                                                    <LineNo>{i + 1}</LineNo>
                                                    <LineContent>
                                                        {line.map((token, key) => (
                                                            <span key={key} {...getTokenProps({ token, key })} />
                                                        ))}
                                                    </LineContent>
                                                </Line>
                                            </CommentButton>
                                            {commentMap.get(i + 1)?.map((comment) => {
                                                return (
                                                    <Box key={comment.contents} sx={{ pt: 1, pb: 1 }}>
                                                        <CommentCard review={review} comment={comment} />
                                                    </Box>
                                                );
                                            })}
                                        </React.Fragment>
                                    ) : (
                                        <Line {...getLineProps({ line, key: i })}>
                                            <LineNo>{i + 1}</LineNo>
                                            <LineContent>
                                                {line.map((token, key) => (
                                                    <span key={key} {...getTokenProps({ token, key })} />
                                                ))}
                                            </LineContent>
                                        </Line>
                                    ),
                                )}
                            </Pre>
                        )}
                    </Highlight>
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
            </Box>
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
        </Box>
    );
}
