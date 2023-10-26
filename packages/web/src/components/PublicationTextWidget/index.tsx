import Box from '@mui/material/Box';
import { Publication } from '../../lib/api/models';
import PublicationLink from '../PublicationLink';
import { PureUserAvatar } from '../UserAvatar';

type PublicationTextWidgetProps = {
    publication: Publication;
};

export default function PublicationTextWidget({ publication }: PublicationTextWidgetProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <PureUserAvatar size={20} {...publication.owner} />
            <PublicationLink
                style={{ paddingLeft: 8, fontWeight: 'bold', color: 'dimgray' }}
                publication={publication}
            />
        </Box>
    );
}
