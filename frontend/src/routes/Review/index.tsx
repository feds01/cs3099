import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React, { ReactElement, useEffect } from 'react';
import { useParams } from 'react-router';
import PageLayout from '../../components/PageLayout';
import TreeView from '../../components/TreeView';

interface ReviewParams {
    id: string;
}

export default function Review(): ReactElement {
    const params = useParams<ReviewParams>();

    useEffect(() => {
        console.log(params.id);
    }, [params.id]);

    // TODO: Have a tree view for the sources on the left
    // TODO: view the sources on the right
    // TODO: jump around sources
    // TODO: display comments
    // TODO: reply to comments
    // TODO: add comments (on file, on lines, general comment)
    // TODO: edit comment
    return (
        <PageLayout title="Review">
            <Container
                sx={{ display: 'flex', p: 1, minWidth: 800, flexDirection: 'row', height: '100%', width: '100%' }}
            >
                <Box
                    sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '30%', overflowY: 'scroll' }}
                >
                   <TreeView paths={[]}/>
                </Box>
                <Box
                    sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '70%', overflowY: 'scroll' }}
                >
                    files
                    <div>Review: {params.id}</div>
                </Box>
            </Container>
        </PageLayout>
    );
}
