import React from 'react';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../hooks/auth';

interface Props {}

export default function Home(props: Props) {
    const { session } = useAuth();

    return (
        <PageLayout title={'Home'}>
            Home Page
            <p>{JSON.stringify(session)}</p>
        </PageLayout>
    );
}
