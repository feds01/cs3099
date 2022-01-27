import CodeRenderer from '../CodeRenderer';
import React, { ReactElement } from 'react';

type Comment = {
    content: string;
    location: {
        start: number;
        end: number;
    };
};

interface FileViewerProps {
    filename: string;
    updatedAt: number;
    contents: string;
    comments: Comment[];
}

export default function FileViewer({ contents, filename }: FileViewerProps): ReactElement {
    return (
        <div>
            <CodeRenderer contents={contents} filename={filename} forceRender />
        </div>
    );
}
