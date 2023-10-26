import { Activity, ActivityKind, ActivityReference, ActivityType } from '../../lib/api/models';
import { Divider, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import PublicationLink from '../PublicationLink';
import UserLink from '../UserLink';
import UserAvatar from '../UserAvatar';
import { formatDistance } from 'date-fns';
import { MdAutoFixHigh, MdDeleteOutline, MdRateReview } from 'react-icons/md';
import { BsStars } from 'react-icons/bs';
import { BiEditAlt } from 'react-icons/bi';
import { IconBaseProps } from 'react-icons';
import ReviewLink from '../ReviewLink';

interface ActivityCardProps {
    activity: Activity;
    withDivider?: boolean;
}

interface LinkWrapperProps {
    reference: ActivityReference;
}

interface ActivityIconProps {
    kind: ActivityKind;
    type: ActivityType;
    iconProps: IconBaseProps;
}

/** Essentially a lookup table of what icon to use when given the type and kind of an Activity */
function ActivityIcon({ kind, type, iconProps }: ActivityIconProps): ReactElement {
    switch (kind) {
        case 'delete':
            return <MdDeleteOutline {...iconProps} />;
        case 'create':
            switch (type) {
                case 'review':
                    return <MdRateReview {...iconProps} />;
                default:
                    return <BsStars {...iconProps} />;
            }
        case 'update':
            return <MdAutoFixHigh {...iconProps} />;
        case 'revise':
            return <BiEditAlt {...iconProps} />;
    }
}

/** Utility component to help render references to various objects on the platform */
function LinkWrapper({ reference }: LinkWrapperProps): ReactElement {
    switch (reference.type) {
        case 'publication':
            return <PublicationLink publication={reference.document} />;
        case 'user':
            return <UserLink user={reference.document} />;
        case 'review':
            return <ReviewLink {...reference.document} />;
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

export default function ActivityCard({
    activity: { message, owner, updatedAt, references, kind, type },
    withDivider = true,
}: ActivityCardProps): ReactElement {
    const parts = message.split(/<\d+>/);

    if (parts.length !== references.length + 1) {
        throw new Error('Invalid number of references in relation to expected');
    }

    return (
        <Box sx={{ m: `8px 0 !important` }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', p: 1 }}>
                <UserAvatar {...owner} displayName={false} size={40} />
                <Box sx={{ width: '100%', paddingLeft: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', flexDirection: 'row' }}>
                            <Typography variant={'body1'}>{owner.name}</Typography>
                            &nbsp;
                            <UserLink user={owner} />
                        </span>
                        <Typography sx={{ color: 'dimgray' }}>
                            {formatDistance(updatedAt, new Date(), { addSuffix: true })}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 1, alignItems: 'center' }}>
                        <ActivityIcon iconProps={{ size: 20, style: { paddingRight: 4 } }} kind={kind} type={type} />
                        <Typography variant={'body1'}>{mapReferences(parts, references)}</Typography>
                    </Box>
                </Box>
            </Box>
            {withDivider && <Divider />}
        </Box>
    );
}
