import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { PublicationIndex } from '../../lib/utils/publications';

interface BreadCrumbProps {
    index: PublicationIndex;
    basePath: string;
    filename: string;
}

export default function BreadCrumb({ index, basePath, filename }: BreadCrumbProps): ReactElement {
    return (
        <Breadcrumbs aria-label="content breadcrumbs" sx={{ pb: 2 }}>
            <Link to={`${basePath}/tree/`}>
                <Typography
                    color="text.primary"
                    sx={{ fontWeight: 'bold', fontSize: 18, '&:hover': { textDecoration: 'underline ' } }}
                >
                    {index.name}
                </Typography>
            </Link>
            {filename
                .split('/')
                .filter((x) => x !== '')
                .map((component, index, parts) => {
                    const subPath = parts.slice(0, index + 1).join('/');
                    return (
                        <Link key={index} to={`${basePath}/tree/${subPath}`}>
                            <Typography
                                color="text.primary"
                                sx={{ fontSize: 18, '&:hover': { textDecoration: 'underline ' } }}
                            >
                                {component}
                            </Typography>
                        </Link>
                    );
                })}
        </Breadcrumbs>
    );
}
