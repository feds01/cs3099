import CodeRenderer from '../CodeRenderer';
import { Box, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGithub, { BuildUrlValues } from 'remark-github';

// We need katex styling in order to properly render math equations
import 'katex/dist/katex.min.css';

/** React Markdown renderer component */
interface MarkdownRendererProps {
    contents: string;
    fontSize?: number;
}

/** Style overrides to fix conflicting styles within the MarkdownRenderer */
const useStyles = makeStyles<Theme, MarkdownRendererProps>((theme) => ({
    wrapper: {
        fontSize: ({ fontSize }) => (fontSize ? `${fontSize}px !important` : 'inherit'),
        listStylePosition: 'inside',
        overflowWrap: 'break-word',
        overflow: 'hidden',
    },
    inlineCode: {
        padding: '0.2em 0.4em',
        fontSize: '85%',
        backgroundColor: 'rgba(175, 184, 193, 0.2)',
        borderRadius: 6,
        margin: '0 !important',
    },
    blockQuote: {
        borderLeft: '0.25em solid #ddd',
        color: '#777',
        marginLeft: 0,
        padding: '0 1em',
        display: 'inline-flex',
        marginBottom: '16px !important',
    },
}));

export default function MarkdownRenderer(props: MarkdownRendererProps): ReactElement {
    const classes = useStyles(props);

    return (
        <ReactMarkdown
            remarkPlugins={[
                [remarkGfm],
                [remarkMath],
                [
                    remarkGithub,
                    {
                        repository: 'iamus/iamus',
                        buildUrl: (opt: BuildUrlValues) => {
                            if (opt.type === 'mention' && opt.user.match(/^[a-zA-Z0-9._~-]*$/)) {
                                return process.env.REACT_APP_SERVICE_URI + `/profile/${opt.user}`;
                            }

                            return;
                        },
                    },
                ],
            ]}
            rehypePlugins={[rehypeKatex]}
            className={classes.wrapper}
            components={{
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');

                    return !inline && match ? (
                        <Box sx={{ pt: 1, pb: 1 }}>
                            <CodeRenderer
                                contents={String(children).replace(/\n$/, '')}
                                filename={''}
                                language={match[1]}
                                lineNumbers={false}
                            />
                        </Box>
                    ) : (
                        <code className={classes.inlineCode}>{children}</code>
                    );
                },
                blockquote({ node, children, ...props }) {
                    return (
                        <blockquote {...props} className={classes.blockQuote}>
                            {children}
                        </blockquote>
                    );
                },
            }}
        >
            {props.contents}
        </ReactMarkdown>
    );
}
