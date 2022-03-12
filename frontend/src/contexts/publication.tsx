import { Publication } from '../lib/api/models';
import { Permission } from '../lib/utils/roles';
import React from 'react';

/** Internal state of the PublicationProvider */
export interface PublicationState {
    /** The relevant publication document. */
    publication: Publication;
    /** What the current user has permissions for.  */
    permission: Permission;
}

export interface PublicationDispatch {
    refetch: () => void;
}

export type PublicationContext = {
    state: PublicationState;
    dispatch: PublicationDispatch;
};

const PublicationStateContext = React.createContext<PublicationContext>({
    // @ts-ignore
    state: {},
    dispatch: {
        refetch: () => undefined,
    },
});

interface PublicationProviderProps {
    children: React.ReactNode;
    state: PublicationState;
    refetch: () => void;
}

export const PublicationProvider = ({ children, state, refetch }: PublicationProviderProps) => {
    return (
        <PublicationStateContext.Provider value={{ state, dispatch: { refetch } }}>
            {children}
        </PublicationStateContext.Provider>
    );
};

export function usePublicationDispatch(): PublicationDispatch {
    const context = React.useContext(PublicationStateContext);

    if (context === undefined) {
        throw new Error('usePublicationDispatch must be used within PublicationProvider');
    }

    return context.dispatch;
}

export function usePublicationState(): PublicationState {
    const context = React.useContext(PublicationStateContext);

    if (context === undefined) {
        throw new Error('usePublicationState must be used within PublicationProvider');
    }

    return context.state;
}
