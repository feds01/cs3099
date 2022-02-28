import React, { ReactElement } from 'react';
import PageLayout from '../../components/PageLayout';
import CreatePublicationForm from '../../forms/CreatePublicationForm';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

export default function CreatePublicationRoute(): ReactElement {
    return (
        <PageLayout>
            <Container maxWidth={'md'} sx={{ pt: 2 }}>
                <Typography variant={'h4'}>Create Publication</Typography>
                <Typography variant={'body1'}>Upload new publication to Iamus</Typography>
                <Divider />
                <CreatePublicationForm />
            </Container>
        </PageLayout>
    );
}
