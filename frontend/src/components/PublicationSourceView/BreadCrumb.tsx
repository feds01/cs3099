import { Typography } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import React, { ReactElement, useEffect, useState } from 'react';

interface Props {
    username: string;
    name: string;
    revision?: string;
    filename: string;
}

function constructBasePath(username: string, name: string, revision?: string) {
    let items = [username, name];

    if (typeof revision !== 'undefined') {
        items.push(revision);
    }

    return "/" + items.join('/');
}

export default function BreadCrumb({ username, name, revision, filename }: Props): ReactElement {
    const [basePath, setBasePath] = useState<string>(constructBasePath(username, name, revision));

    useEffect(() => {
        setBasePath(constructBasePath(username, name, revision));
    }, [username, name, revision]);

    return (
        <Breadcrumbs aria-label="content breadcrumbs">
            {filename.split('/').map((component, index, parts) => {
                const subPath = parts.slice(0, index).join('/');
                return (
                    <Link
                        key={index}
                        underline="hover"
                        color="inherit"
                        href={`${basePath}/tree/${subPath}`}
                    >
                        <Typography color="text.primary" sx={{ fontWeight: 'bold', fontSize: 16, }}>
                            {component}
                        </Typography>
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
}
