import React, { ReactElement } from 'react';
import Link from '@mui/material/Link';
import { Typography } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { PublicationIndex } from '../../lib/utils/publications';

interface Props {
    index: PublicationIndex;
    basePath: string;
    filename: string;
}

export default function BreadCrumb({ index, basePath, filename }: Props): ReactElement {
    return (
        <Breadcrumbs aria-label="content breadcrumbs" sx={{m: 1}}>
            <Link underline="hover" color="inherit" href={`${basePath}/tree/`}>
                <Typography color="text.primary" sx={{ fontWeight: 'bold', fontSize: 18 }}>
                    {index.name}
                </Typography>
            </Link>
            {filename
                .split('/')
                .filter((x) => x !== '')
                .map((component, index, parts) => {
                    const subPath = parts.slice(0, index + 1).join('/');
                    return (
                        <Link key={index} underline="hover" color="inherit" href={`${basePath}/tree/${subPath}`}>
                            <Typography color="text.primary" sx={{ fontSize: 18 }}>
                                {component}
                            </Typography>
                        </Link>
                    );
                })}
        </Breadcrumbs>
    );
}
