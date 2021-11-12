import React, { ReactElement, useEffect } from 'react';
import { useParams } from 'react-router';

interface Props {}

interface ReviewParams {
    id: string;
}

export default function Review({}: Props): ReactElement {
    const params = useParams<ReviewParams>();

    useEffect(() => {
        console.log(params.id);
    }, [params.id]);

    // TODO: Have a tree view for the sources on the left
    // TODO: view the sources on the right
    // TODO: jump around sources
    // TODO: display comments
    // TODO: reply to comments
    // TODO: add comments (on file, on lines, general comment)
    // TODO: edit comment
    return <div>Review: {params.id}</div>;
}
