import React, { ReactElement } from 'react';
import PageLayout from '../../components/PageLayout';
import CreatePublicationForm from '../../components/CreatePublicationForm';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface Props {}

export default function CreatePublicationRoute({}: Props): ReactElement {
    return (
        <PageLayout>
            <Container maxWidth={'md'} sx={{mt: 2}}>
                <Typography variant={'h4'}>Create Publication</Typography>
                <Typography variant={'caption'}>Upload new publication to Iamus</Typography>
                <Divider />
                <CreatePublicationForm />
            </Container>
        </PageLayout>
    );
}
