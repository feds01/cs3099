import Prism from 'prismjs';
import Box from '@mui/material/Box/Box';
import { ReactElement } from 'react';
import { styled, Typography } from '@mui/material';
import { coerceExtensionToLanguage, getExtension } from '../../lib/utils/file';
import theme from 'prism-react-renderer/themes/github';
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
import CommentButton from '../CommentButton';
import { Review } from '../../lib/api/models';

type PrismLib = typeof PrismRR & typeof Prism;

interface Props {
    contents: string;
    filename: string;
    language?: string;
    titleBar?: boolean;
    review?: Review;
}

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

export default function CodeRenderer({ contents, titleBar = false, filename, review, language }: Props): ReactElement {
    const extension = coerceExtensionToLanguage(getExtension(filename) ?? '');

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
                    <Typography sx={{ fontWeight: 'bold' }}>{filename}</Typography>
                </Box>
            )}
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
                                <CommentButton key={i} review={review} location={i} filename={filename}>
                                    <Line {...getLineProps({ line, key: i })}>
                                        <LineNo>{i + 1}</LineNo>
                                        <LineContent>
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token, key })} />
                                            ))}
                                        </LineContent>
                                    </Line>
                                </CommentButton>
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
        </Box>
    );
}
