import React, { ReactElement } from 'react';
import { Publication } from '../../../lib/api/models';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import EditPublicationForm from '../../../forms/EditPublicationForm';
import { usePublicationState } from '../../../hooks/publication';

export default function Settings(): ReactElement {
    const { publication } = usePublicationState();

    return (
        <Container maxWidth={'md'} sx={{ pt: 2 }}>
            <Typography variant={'h4'}>Edit Publication</Typography>
            <Typography variant={'caption'}>Make changes or updates to a current publication</Typography>
            <Divider />
            <EditPublicationForm publication={publication} />
        </Container>
    );
}
