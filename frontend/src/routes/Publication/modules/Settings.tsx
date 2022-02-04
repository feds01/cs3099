import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EditPublicationForm from '../../../forms/EditPublicationForm';
import { usePublicationState } from '../../../hooks/publication';
import DeletePublicationForm from '../../../forms/DeletePublicationForm';

export default function Settings(): ReactElement {
    const { publication } = usePublicationState();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ pt: 1 }}>
                <Typography variant={'h5'}>Edit Publication</Typography>
                <Typography variant={'body2'}>Make changes or updates to a current publication</Typography>
                <Divider sx={{ mb: 2 }} />
                <EditPublicationForm publication={publication} />
            </Box>
            <Box sx={{ pt: 4 }}>
                <Typography variant={'h5'}>Delete Publication</Typography>
                <Typography variant={'body2'}>Delete the current publication</Typography>
                <Divider />
                <DeletePublicationForm publication={publication} />
            </Box>
        </Box>
    );
}
