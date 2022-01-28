import React, { ReactElement } from 'react';
import Prism from 'prismjs';
import Box from '@mui/material/Box/Box';
import { styled } from '@mui/material';
import CommentCard from '../CommentCard';
import CommentButton from '../CommentButton';
import { Review, Comment } from '../../lib/api/models';
import theme from 'prism-react-renderer/themes/github';
import { coerceExtensionToLanguage, getExtension } from '../../lib/utils/file';
import Highlight, { Language, Prism as PrismRR } from 'prism-react-renderer';

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

interface CodeRendererProps {
    contents: string;
    filename: string;
    language?: string;
    review?: Review;
    commentMap?: Map<number, Comment[]>;
}

export default function CodeRenderer({
    contents,
    filename,
    review,
    commentMap,
    language,
}: CodeRendererProps): ReactElement {
    const extension = coerceExtensionToLanguage(getExtension(filename) ?? language ?? '');

    return (
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
                                {commentMap?.get(i + 1)?.map((comment) => {
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
    );
}
