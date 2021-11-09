import React, { ReactElement } from 'react';

interface Props {
    username: string;
}

export default function Reviews({ username }: Props): ReactElement {
    return <div>Reviews - {username}</div>;
}
