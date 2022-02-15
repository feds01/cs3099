import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import UserLink from '../../../components/UserLink';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import { usePublicationState } from '../../../hooks/publication';

export default function Overview(): ReactElement {
    const { publication } = usePublicationState();

    return (
        <Box>
            {publication.introduction ? (
                <MarkdownRenderer contents={publication.introduction} />
            ) : (
                <>
                    <UserLink user={publication.owner} /> hasn't provided an introduction for this
                    publication
                </>
            )}
        </Box>
    );
}
