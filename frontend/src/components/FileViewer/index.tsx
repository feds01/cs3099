import React, { ReactElement } from 'react';
import CodeRenderer from '../CodeRenderer';

type Comment = {
    content: string;
    location: {
        start: number;
        end: number;
    };
};

interface Props {
    filename: string;
    updatedAt: number;
    contents: string;
    comments: Comment[];
}

export default function FileViewer({ contents, updatedAt, comments = [], filename }: Props): ReactElement {
    return (
        <div>
            <CodeRenderer contents={contents} language={'ts'} showLineNumbers />
        </div>
    );
}
