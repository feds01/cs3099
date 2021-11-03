import { Typography } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import React, { ReactElement, useEffect, useState } from 'react';
import { PublicationIndex } from '../../lib/utils/publications';

interface Props {
    index: PublicationIndex;
    basePath: string;
    filename: string;
}

export default function BreadCrumb({ index, basePath, filename }: Props): ReactElement {
    return (
        <Breadcrumbs aria-label="content breadcrumbs">
            <Link underline="hover" color="inherit" href={`${basePath}/tree/`}>
                <Typography color="text.primary" sx={{ fontWeight: 'bold', fontSize: 16 }}>
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
                            <Typography color="text.primary" sx={{ fontSize: 16 }}>
                                {component}
                            </Typography>
                        </Link>
                    );
                })}
        </Breadcrumbs>
    );
}
