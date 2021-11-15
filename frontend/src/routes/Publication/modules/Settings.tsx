import React, { ReactElement } from 'react';
import { Publication } from '../../../lib/api/models';

interface Props {
    publication: Publication
}

export default function Settings({}: Props): ReactElement {
    return <div>Settings</div>;
}
