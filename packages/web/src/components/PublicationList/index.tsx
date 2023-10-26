import { Publication } from '../../lib/api/models';
import PublicationCard from '../PublicationCard';
import VoidImage from '../../static/images/void.svg';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import PublicationTextWidget from '../PublicationTextWidget';

type PublicationListProps = {
    publications: Publication[];
    textual?: boolean;
};

export default function PublicationList({ publications, textual = false }: PublicationListProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {publications.length === 0 ? (
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
                    <Typography variant="body2">No publications yet.</Typography>
                </Box>
            ) : (
                <Grid container spacing={1} columns={{ xs: 1, sm: 1, md: 1 }} sx={{ marginTop: '0.25rem' }}>
                    {publications.map((publication) => {
                        return (
                            <Grid key={publication.id} item xs={2} sm={3} md={3}>
                                {textual ? (
                                    <PublicationTextWidget publication={publication} />
                                ) : (
                                    <PublicationCard publication={publication} />
                                )}
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}
