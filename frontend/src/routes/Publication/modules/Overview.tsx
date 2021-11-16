import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import { Publication } from '../../../lib/api/models';
import MarkdownRenderer from '../../../components/MarkdownRenderer';

interface Props {
    publication: Publication;
}

export default function Overview({ publication }: Props): ReactElement {
    return (
        <Box>
            {publication.introduction ? (
                <MarkdownRenderer contents={publication.introduction} />
            ) : (
                "Owner hasn't posted a introduction."
            )}
        </Box>
    );
}
