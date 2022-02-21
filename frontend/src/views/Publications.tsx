import ErrorBanner from '../components/ErrorBanner';
import PublicationList from '../components/PublicationList';
import SkeletonList from '../components/SkeletonList';
import { Publication, User } from '../lib/api/models';
import { useGetPublicationUsername } from '../lib/api/publications/publications';
import { ContentState } from '../types/requests';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ReactElement, useEffect, useState } from 'react';

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
            const data = getPublicationQuery.data.publications.sort((a, b) => {
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
                return <ErrorBanner message={publications.error.message} />;
            case 'ok':
                return <PublicationList publications={publications.data} />;
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
