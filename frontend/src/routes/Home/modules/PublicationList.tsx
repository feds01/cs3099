import { useAuth } from '../../../hooks/auth';
import { ReactElement, useEffect, useState } from 'react';
import { GetPublicationUsername200 as GetPublications } from '../../../lib/api/models';
import { ContentState } from '../../../types/requests';
import SkeletonList from '../../../components/SkeletonList';
import ErrorBanner from '../../../components/ErrorBanner';
import { transformQueryIntoContentState } from '../../../wrappers/react-query';
import { useGetPublicationUsername } from '../../../lib/api/publications/publications';

export default function PublicationList(): ReactElement {
    const auth = useAuth();

    const getPublicationsQuery = useGetPublicationUsername(auth.session.username);
    const [publications, setPublications] = useState<ContentState<GetPublications, any>>({ state: 'loading' });

    useEffect(() => {
        setPublications(transformQueryIntoContentState(getPublicationsQuery));
    }, [getPublicationsQuery.data, getPublicationsQuery.isLoading]);

    switch (publications.state) {
        case 'loading':
            return <SkeletonList rows={3} />;
        case 'error':
            return <ErrorBanner message={publications.error?.message || 'unknown error occurred.'} />;
        case 'ok':
            return <div>{JSON.stringify(publications.data.data)}</div>;
    }
}
