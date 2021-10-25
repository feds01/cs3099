import React from 'react';
import { useAuth } from '../../hooks/auth';
import PageLayout from '../../components/PageLayout';

interface Props {}

export default function Home(props: Props) {
    const { session } = useAuth();

    return (
        <PageLayout title={'Account Settings'}>
            Settings
            <p>{JSON.stringify(session)}</p>
        </PageLayout>
    );
}
