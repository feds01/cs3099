import { ReactElement } from 'react';
import remarkGfm from 'remark-gfm';
import { Theme } from '@mui/material';
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
                        <CodeRenderer
                            contents={String(children).replace(/\n$/, '')}
                            filename={''}
                            language={match[1]}
                        />
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        >
            {props.contents}
        </ReactMarkdown>
    );
}
