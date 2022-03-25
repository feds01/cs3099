import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Review } from '../../lib/api/models';
import VoidImage from '../../static/images/void.svg';
import ReviewCard from '../ReviewCard';
import ReviewTextWidget from '../ReviewTextWidget';

type ReviewListProps = {
    reviews: Review[];
    textual?: boolean;
};

export default function ReviewList({ reviews, textual = false }: ReviewListProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {reviews.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        pt: 2,
                    }}
                >
                    <img src={VoidImage} height={96} width={96} alt={'nothing'} />
                    <Typography variant="body2">No reviews yet.</Typography>
                </Box>
            ) : (
                <Grid container spacing={1} columns={{ xs: 1, sm: 1, md: 1 }} sx={{ marginTop: '0.25rem', pb: 1 }}>
                    {reviews.map((review) => {
                        return (
                            <Grid key={review.id} item xs={2} sm={3} md={3}>
                                {textual ? <ReviewTextWidget review={review} /> : <ReviewCard review={review} />}
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}
