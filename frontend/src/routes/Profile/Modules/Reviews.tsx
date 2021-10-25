import React, { ReactElement } from 'react';

interface Props {
    id: string;
}

export default function Reviews({ id }: Props): ReactElement {
    return <div>Reviews - {id}</div>;
}
