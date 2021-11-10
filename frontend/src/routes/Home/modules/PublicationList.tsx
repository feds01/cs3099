import React, { ReactElement, useState } from 'react'
import { useAuth } from '../../../hooks/auth';
import { Publication } from '../../../lib/api/models';
import { useGetPublicationUsername } from '../../../lib/api/publications/publications';
import { ContentState } from '../../../types/requests';

interface Props {
    
}

export default function PublicationList({}: Props): ReactElement {
    const auth = useAuth();

    const pubQuery = useGetPublicationUsername(auth.session.username);
    
    const [publications, setPublications] = useState<ContentState<Publication[], any>>({ state: 'loading' });

    switch (publications.state){
        case 'loading':
            return <>Loading...</>;
        case 'error':
            return <>Something went wrong :(</>;
        case 'ok':
            return (
                <div>
                </div>
            );
        }
}
