import { Review } from '../../lib/api/models';
import { CommentThread } from '../../lib/utils/comment';
import { coerceExtensionToLanguage, getExtension } from '../../lib/utils/file';
import CommentButton from '../CommentButton';
import CommentThreadRenderer from '../CommentThreadRenderer';
import Highlight from './PrismRenderer';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import { useSelectionState } from '../../contexts/selection';

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

interface CodeRendererProps {
    contents: string;
    filename: string;
    language?: string;
    review?: Review;
    commentMap?: Map<number, CommentThread[]>;
    lineNumbers?: boolean;
    lineOffset?: number;
    worker?: Worker;
}

export default function CodeRenderer({
    contents,
    filename,
    review,
    commentMap,
    language,
    lineNumbers = true,
    lineOffset = 0,
    worker,
}: CodeRendererProps): ReactElement {
    const extension = coerceExtensionToLanguage(getExtension(filename) ?? language ?? '');
    const selectionState = useSelectionState();

    return (
        <Highlight code={contents} language={extension ?? 'text'} worker={worker}>
            {({ style, tokens, getLineProps, getTokenProps }) => (
                <Pre style={style}>
                    {tokens.map((line, i) => (
                        <React.Fragment key={i}>
                            {typeof review !== 'undefined' && review.status === 'started' ? (
                                <CommentButton key={i} review={review} location={i} filename={filename}>
                                    <Line {...getLineProps({ line })}>
                                        {lineNumbers && <LineNo>{i + 1 + lineOffset}</LineNo>}
                                        <LineContent sx={{ userSelect: selectionState.isDragging ? 'none' : 'auto' }}>
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token, key })} />
                                            ))}
                                        </LineContent>
                                    </Line>
                                </CommentButton>
                            ) : (
                                <Line {...getLineProps({ line })}>
                                    {lineNumbers && <LineNo>{i + 1 + lineOffset}</LineNo>}
                                    <LineContent>
                                        {line.map((token, key) => (
                                            <span key={key} {...getTokenProps({ token, key })} />
                                        ))}
                                    </LineContent>
                                </Line>
                            )}
                            {typeof review !== 'undefined' &&
                                commentMap?.get(i + 1)?.map((thread) => {
                                    return (
                                        <Box key={thread.id} sx={{ pt: 1, pb: 1 }}>
                                            <CommentThreadRenderer thread={thread} />
                                        </Box>
                                    );
                                })}
                        </React.Fragment>
                    ))}
                </Pre>
            )}
        </Highlight>
    );
}
