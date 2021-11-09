
import React, { ReactElement } from 'react'
import PageLayout from '../../components/PageLayout'
import CreatePublicationForm from '../../components/CreatePublicationForm'

interface Props {
    
}

export default function CreatePublicationRoute({}: Props): ReactElement {
    return (
        <PageLayout>
            <CreatePublicationForm/>
        </PageLayout>
    )
}