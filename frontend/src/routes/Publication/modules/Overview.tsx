import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import UserLink from '../../../components/UserLink';
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
                <>
                    <UserLink username={publication.owner.username} /> hasn't provided an introduction for this
                    publication
                </>
            )}
        </Box>
    );
}
