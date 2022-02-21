import { Publication } from '../../lib/api/models';
import MarkdownRenderer from '../MarkdownRenderer';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';

interface Props {
    publication: Publication;
}

export default function PublicationCard({ publication }: Props): ReactElement {
    return (
        <Card>
            <Link to={`/${publication.owner.username}/${publication.name}`}>
                <CardContent sx={{ p: '0.4rem', backgroundColor: '#f5fafc' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '100%', paddingLeft: 0.5 }}>
                            <Typography variant={'h5'} sx={{ fontStyle: 'bold', display: 'inline-block' }}>
                                {publication.draft && (
                                    <Chip
                                        sx={{
                                            fontWeight: 'bold',
                                        }}
                                        label="draft"
                                        color="primary"
                                        size="small"
                                    />
                                )}{' '}
                                <b>{publication.name}</b>
                            </Typography>
                            <MarkdownRenderer contents={publication.about ?? publication.introduction ?? ''} />
                        </Box>
                    </Box>
                </CardContent>
            </Link>
        </Card>
    );
}
