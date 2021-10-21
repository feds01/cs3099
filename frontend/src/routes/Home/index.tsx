import React from 'react';
import { useAuth } from '../../hooks/auth';

interface Props {}

export default function Home(props: Props) {
    const { session } = useAuth();
    
    return (
        <div>
            Home Page
            <p>{JSON.stringify(session)}</p>
        </div>
    );
}
