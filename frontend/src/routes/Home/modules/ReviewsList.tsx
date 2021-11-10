// import { useAuth } from '../../../hooks/auth';
import { ReactElement, useState } from 'react'
import { Publication } from '../../../lib/api/models';
import { ContentState } from '../../../types/requests';
import SkeletonList from '../../../components/SkeletonList';

export default function ReviewsList(): ReactElement {
    // const auth = useAuth();
    // const pubQuery = useGetPublicationUsername(auth.session.username);
    
    const [reviews] = useState<ContentState<Publication[], any>>({ state: 'loading' });

    switch (reviews.state){
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
