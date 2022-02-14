import { ReactElement } from 'react';
import remarkGfm from 'remark-gfm';
import { Box, Theme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import CodeRenderer from '../CodeRenderer';
import makeStyles from '@mui/styles/makeStyles';

interface MarkdownRendererProps {
    contents: string;
    fontSize?: number;
}

const useStyles = makeStyles<Theme, MarkdownRendererProps>((theme) => ({
    wrapper: {
        fontSize: ({ fontSize }) => (fontSize ? `${fontSize}px !important` : 'inherit'),
        listStylePosition: 'inside',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
    },
    inlineCode: {
        padding: '0.2em 0.4em',
        fontSize: '85%',
        backgroundColor: 'rgba(175, 184, 193, 0.2)',
        borderRadius: 6,
        margin: '0 !important',
    },
}));

export default function MarkdownRenderer(props: MarkdownRendererProps): ReactElement {
    const classes = useStyles(props);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
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
            }}
        >
            {props.contents}
        </ReactMarkdown>
    );
}
