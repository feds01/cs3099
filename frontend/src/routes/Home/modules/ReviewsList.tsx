import { useAuth } from '../../../hooks/auth';
import { ReactElement, useState } from 'react'
import { Publication } from '../../../lib/api/models';
import { ContentState } from '../../../types/requests';
import SkeletonList from '../../../components/SkeletonList';

interface Props {
    
}

export default function ReviewsList({}: Props): ReactElement {
    const auth = useAuth();

    // const pubQuery = useGetPublicationUsername(auth.session.username);
    
    const [publications, setPublications] = useState<ContentState<Publication[], any>>({ state: 'loading' });

    switch (publications.state){
        case 'loading':
            return <SkeletonList rows={3} />;
        case 'error':
            return <>Something went wrong :(</>;
        case 'ok':
            return (
                <div>
                    reviews!
                </div>
            );
        }
}
