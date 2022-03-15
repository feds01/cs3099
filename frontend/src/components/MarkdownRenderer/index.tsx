import CodeRenderer from '../CodeRenderer';
import { Box, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGithub, { BuildUrlValues } from 'remark-github';

interface MarkdownRendererProps {
    contents: string;
    fontSize?: number;
}

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
}));

export default function MarkdownRenderer(props: MarkdownRendererProps): ReactElement {
    const classes = useStyles(props);

    return (
        <ReactMarkdown
            remarkPlugins={[
                [remarkGfm],
                [
                    remarkGithub,
                    {
                        repository: 'iamus/iamus',
                        buildUrl: (opt: BuildUrlValues) => {
                            console.log(opt);

                            if (opt.type === 'mention' && opt.user.match(/^[a-zA-Z0-9._~-]*$/)) {
                                return process.env.REACT_APP_SERVICE_URI + `/user/${opt.user}`;
                            }

                            return;
                        },
                    },
                ],
            ]}
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
