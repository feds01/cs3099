import React, { ReactElement } from 'react';
import { Prism as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props extends SyntaxHighlighterProps {
    contents: string;
}

export default function CodeRenderer({ contents, ...rest }: Props): ReactElement {
    return (
        <div>
            <SyntaxHighlighter children={contents} style={duotoneLight} PreTag="div" {...rest} />
        </div>
    );
}
