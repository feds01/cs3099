import { usePublicationState } from '../../../contexts/publication';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import UserCard from '../../../components/UserCard';

export default function Collaborators() {
    const {
        publication: { collaborators },
    } = usePublicationState();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h4">Collaborators</Typography>
            </Box>
            <Divider />
            <Box sx={{ width: '100%' }}>
                <Grid container spacing={1} columns={{ xs: 4, sm: 9, md: 12 }}>
                    {collaborators.map((collaborator) => {
                        return (
                            <Grid key={collaborator.username} item xs={2} sm={3} md={3}>
                                <UserCard key={collaborator.id} user={collaborator} />
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}
