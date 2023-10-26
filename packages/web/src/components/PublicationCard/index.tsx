import { Publication } from '../../lib/api/models';
import MarkdownRenderer from '../MarkdownRenderer';
import PublicationLink from '../PublicationLink';
import UserAvatar from '../UserAvatar';
import { Box, Card, CardContent, CardHeader, Chip, Typography, useTheme } from '@mui/material';
import truncateMarkdown from 'markdown-truncate';
import { ReactElement } from 'react';
import { constructBasePathFromPublication } from '../../lib/utils/publications';
import { Link } from 'react-router-dom';

interface PublicationCardProps {
    publication: Publication;
}

export default function PublicationCard({ publication }: PublicationCardProps): ReactElement {
    const theme = useTheme();
    const basename = constructBasePathFromPublication(publication);

    return (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardHeader
                avatar={<UserAvatar {...publication.owner} />}
                disableTypography
                {...(publication.reviews > 0 && {
                    subheader: (
                        <Link to={`${basename}/reviews`}>
                            <Typography
                                variant="body2"
                                sx={{ color: 'dimgray', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Publication has {publication.reviews} {publication.reviews === 1 ? 'review' : 'reviews'}{' '}
                                on it.
                            </Typography>
                        </Link>
                    ),
                })}
                title={
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            lineHeight: '28px !important',
                        }}
                    >
                        <Typography variant={'h5'} sx={{ fontWeight: 'bold', display: 'inline-block' }}>
                            <PublicationLink style={{ color: theme.palette.text.primary }} publication={publication} />
                        </Typography>
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
                        <Typography variant={'h5'} sx={{ fontWeight: 'bold', display: 'inline-block' }}>
                            <PublicationLink style={{ color: theme.palette.text.primary }} {...publication} />
                        </Typography>
                        <Typography variant={'body1'} sx={{ lineHeight: '28px !important' }}>
                            {publication.about && <>&nbsp;- </>}
                            {publication.about}
                        </Typography>
                    </Box>
                }
            />
            <CardContent sx={{ p: '0.4rem' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Box
                        sx={{
                            width: '100%',
                            paddingLeft: 0.5,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                        }}
                    >
                        {publication.introduction ? (
                            <MarkdownRenderer
                                contents={truncateMarkdown(publication.introduction ?? '', {
                                    limit: 250,
                                    ellipsis: true,
                                })}
                            />
                        ) : (
                            <i>Publication has no description section yet.</i>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
