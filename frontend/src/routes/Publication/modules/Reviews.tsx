import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React, { ReactElement } from 'react';
import { Publication } from '../../../lib/api/models';
import PublicationReviews from '../../../views/PublicationReviews';

interface Props {
    publication: Publication;
}

export default function Reviews({ publication }: Props): ReactElement {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="h4">Reviews</Typography>
                <Box>
                    <Button>Add review</Button>
                </Box>
            </Box>
            <Divider />
            <PublicationReviews publication={publication} />
        </Box>
    );
}
