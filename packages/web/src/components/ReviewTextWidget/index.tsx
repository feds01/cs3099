import Box from '@mui/material/Box';
import { Review } from '../../lib/api/models';
import PublicationLink from '../PublicationLink';
import ReviewLink from '../ReviewLink';
import UserAvatar from '../UserAvatar';

type ReviewTextWidgetProps = {
    review: Review;
};

export default function ReviewTextWidget({ review }: ReviewTextWidgetProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            <UserAvatar size={20} displayName={true} userLink={true} position="right" {...review.owner} />
            &nbsp;left a&nbsp;
            <ReviewLink {...review} />
            &nbsp;on&nbsp;
            <PublicationLink style={{ fontWeight: 'bold', color: 'dimgray' }} publication={review.publication} />
        </Box>
    );
}
