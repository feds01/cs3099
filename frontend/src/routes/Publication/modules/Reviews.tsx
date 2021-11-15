import React, { ReactElement } from 'react';
import { Publication } from '../../../lib/api/models';

interface Props {
    publication: Publication
}

export default function Reviews({publication}: Props): ReactElement {
    return <div>Reviews</div>;
}
