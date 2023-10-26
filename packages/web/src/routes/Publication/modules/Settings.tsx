import DeletePublicationForm from '../../../forms/DeletePublicationForm';
import EditPublicationForm from '../../../forms/UpdatePublicationForm';
import { usePublicationState } from '../../../contexts/publication';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ReactElement } from 'react';

export default function Settings(): ReactElement {
    const { publication, permission } = usePublicationState();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ pt: 1 }}>
                <Typography variant={'h5'}>Edit Publication</Typography>
                <Typography variant={'body2'}>Make changes or updates to a current publication</Typography>
                <Divider sx={{ mb: 2 }} />
                <EditPublicationForm publication={publication} />
            </Box>
            {permission.delete && (
                <Box sx={{ pt: 4 }}>
                    <Typography variant={'h5'}>Delete Publication</Typography>
                    <Typography variant={'body2'}>Delete the current publication</Typography>
                    <Divider />
                    <DeletePublicationForm publication={publication} deleteAll />
                </Box>
            )}
        </Box>
    );
}
