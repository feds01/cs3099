import React, { ReactElement } from 'react';
import { DirectoryResponseData } from '../../lib/api/models';

type Props = DirectoryResponseData & { filename: string };

// File Icons: https://react-icons.github.io/react-icons/icons?name=si
export default function DirectoryViewer({ entries, filename }: Props): ReactElement {
    return <div>Directory Viewer! For: {filename}</div>;
}
