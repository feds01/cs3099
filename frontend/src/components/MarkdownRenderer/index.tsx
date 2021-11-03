import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import React, { ReactElement } from 'react';
import CodeRenderer from '../CodeRenderer';

interface Props {
    contents: string;
}

export default function index({ contents }: Props): ReactElement {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');

                    return !inline && match ? (
                        <CodeRenderer contents={String(children).replace(/\n$/, '')} language={match[1]} />
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        >
            {contents}
        </ReactMarkdown>
    );
}
