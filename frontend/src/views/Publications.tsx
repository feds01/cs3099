import { Box, Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import VoidImage from '../static/images/void.svg';
import { ReactElement, useEffect, useState } from 'react';
import { ContentState } from '../types/requests';
import ErrorBanner from '../components/ErrorBanner';
import { Publication, User } from '../lib/api/models';
import SkeletonList from '../components/SkeletonList';
import PublicationCard from '../components/PublicationCard';
import { useGetPublicationUsername } from '../lib/api/publications/publications';

interface Props {
    user: User;
    limit?: number;
    withTitle?: boolean;
}

export default function Publications({ user, limit, withTitle = true }: Props): ReactElement {
    const getPublicationQuery = useGetPublicationUsername(user.username);

    const [publications, setPublications] = useState<ContentState<Publication[], any>>({ state: 'loading' });

    useEffect(() => {
        if (getPublicationQuery.data) {
            // Here we essentially have to sort by pinned publications and then add remaining
            // publications that have been added up to the specified limit.
            const data = getPublicationQuery.data.data.sort((a, b) => {
                if (a.pinned && b.pinned) return 0;

                return a.pinned > b.pinned ? -1 : 0;
            });

            setPublications({ state: 'ok', data: data.slice(0, limit) });
        } else if (getPublicationQuery.isError && getPublicationQuery.error) {
            setPublications({ state: 'error', error: getPublicationQuery.error });
        }
    }, [getPublicationQuery.data, getPublicationQuery.isLoading]);

    function renderContent() {
        switch (publications.state) {
            case 'loading':
                return <SkeletonList rows={3} />;
            case 'error':
                return <ErrorBanner message={publications.error?.message || 'unknown error occurred.'} />;
            case 'ok':
                return (
                    <div>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {publications.data.length === 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        width: '100%',
                                        pt: 2,
                                    }}
                                >
                                    <img src={VoidImage} height={96} width={96} alt={'nothing'} />
                                    <Typography variant="body2">No publications yet.</Typography>
                                </Box>
                            ) : (
                                <Grid
                                    container
                                    spacing={1}
                                    columns={{ xs: 1, sm: 1, md: 1 }}
                                    sx={{ marginTop: '0.25rem' }}
                                >
                                    {publications.data.map((pub) => {
                                        return (
                                            <Grid key={pub.name} item xs={2} sm={3} md={3}>
                                                <PublicationCard key={pub.name} user={user} pub={pub} />
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            )}
                        </Box>
                    </div>
                );
        }
    }

    return (
        <>
            {withTitle && (
                <>
                    <Typography variant="h4">Publications</Typography>
                    <Divider />
                </>
            )}
            {renderContent()}
        </>
    );
}
