import { ActivityReference } from '../../lib/api/models';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import PublicationLink from '../PublicationLink';
import UserLink from '../UserLink';
import { Link } from 'react-router-dom';

interface ActivityCardProps {
    message: string;
    references: ActivityReference[];
}

interface LinkWrapperProps {
    reference: ActivityReference;
}

/** Utility component to help render references to various objects on the platform */
function LinkWrapper({ reference }: LinkWrapperProps): ReactElement {
    switch (reference.type) {
        case 'publication':
            return <PublicationLink {...reference.document} />;
        case 'user':
            return <UserLink user={reference.document} />;
        case 'review':
            return <Link to={`/review/${reference.document.id}`}>review</Link>;
        case 'comment':
            // @@Future: we currently don't have a way to jump to specific comments. we could
            //           do this in a special view on reviews where it jumps to the particular comment
            //           with that id?
            return <>comment</>;
    }
}

function mapReferences(parts: string[], references: ActivityReference[]): ReactElement[] {
    return parts.map((value, index, size) => {
        if (index < size.length - 1) {
            return (
                <React.Fragment key={index}>
                    {value}
                    <LinkWrapper reference={references[index]} />
                </React.Fragment>
            );
        }

        return <React.Fragment key={index}>{value}</React.Fragment>;
    });
}

export default function ActivityCard({ message, references }: ActivityCardProps): ReactElement {
    const parts = message.split(/<\d+>/);

    if (parts.length !== references.length + 1) {
        throw new Error('Invalid number of references in relation to expected');
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
            <Typography variant={'body1'}>{mapReferences(parts, references)}</Typography>
        </Box>
    );
}
