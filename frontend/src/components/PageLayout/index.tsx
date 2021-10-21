import React, { ReactElement } from 'react';

interface Props {
    children: React.ReactNode;
}

export default function PageLayout({ children }: Props): ReactElement {
    return (
        <div>
            page layout!
            <div>{children}</div>
        </div>
    );
}
