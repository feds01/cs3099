import React, { ReactElement } from 'react';
import { Publication } from '../../../lib/api/models';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import EditPublicationForm from '../../../forms/EditPublicationForm';

interface Props {
    publication: Publication
}

export default function Settings({publication}: Props): ReactElement {
    return (
        <Container maxWidth={'md'} sx={{ pt: 2 }}>
            <Typography variant={'h4'}>Edit Publication</Typography>
            <Typography variant={'caption'}>Make changes or updates to a current publication</Typography>
            <Divider />
            <EditPublicationForm/>
        </Container>
    );
}
