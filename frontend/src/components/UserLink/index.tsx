import Link from '@mui/material/Link';
import { ReactElement } from 'react';

interface Props {
    username: string;
}

export default function UserLink({ username }: Props): ReactElement {
    return <Link href={`/profile/${username}`}>@{username}</Link>;
}
