import React, { ReactElement } from 'react';
import { IconMap } from '../../lib/utils/file';
import { RiFolderFill, RiFileFill, RiFolderOpenFill } from 'react-icons/ri';

interface Props {
    type: 'directory' | 'file';
    open: boolean;
    extension: string;
};

export default function FileIcon({ type, open, extension }: Props): ReactElement {
    if (type === 'directory') {
        return open ? <RiFolderOpenFill size={16} /> : <RiFolderFill size={16} />;
    }
    const Icon = extension in IconMap ? IconMap[extension] : RiFileFill;

    return <Icon size={16} />;
}
