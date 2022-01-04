import React from 'react';


export type NotificationSeverity = 'error' | 'warn' | 'success';
export type NotificationUpdateAction = 'add' | 'remove' | 'removeAll';
export type NotificationUpdate = { type: 'add'; item: Notification } | { type: 'remove' } | { type: 'removeAll' };

export type Notification = {
    severity: NotificationSeverity;
    message: string;
};

export type NotificationState = Notification[];


const NotificationStateContext = React.createContext<{
    state: NotificationState;
    dispatch: React.Dispatch<NotificationUpdate>;
}>({
    state: [],
    dispatch: () => undefined,
});

export function notificationReducer(state: NotificationState, action: NotificationUpdate): NotificationState {
    switch (action.type) {
        case 'add':
            return [...state, action.item];
        case 'remove':
            state.shift();
            return state;
        case 'removeAll':
            return [];
    }
}

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(notificationReducer, []);

    return (
        <NotificationStateContext.Provider value={{ state, dispatch }}>{children}</NotificationStateContext.Provider>
    );
};

function useNotificationState(): NotificationState {
    const context = React.useContext(NotificationStateContext);

    if (context === undefined) {
        throw new Error('useNotificationState must be used within NotificationProvider');
    }

    return context.state;
}

function useNotificationDispatch() {
    const context = React.useContext(NotificationStateContext);

    if (context === undefined) {
        throw new Error('useNotificationState must be used within NotificationProvider');
    }

    return context.dispatch;
}

export { NotificationProvider, useNotificationState, useNotificationDispatch };
