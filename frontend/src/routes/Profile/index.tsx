import { ReactElement } from 'react';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../hooks/auth';

interface Props {}

export default function Profile(props: Props): ReactElement {
    const auth = useAuth();

    return (
        <PageLayout title={'Profile'} sidebar={false}>
            Profile
            {JSON.stringify(auth.session)}
        </PageLayout>
    );
}
