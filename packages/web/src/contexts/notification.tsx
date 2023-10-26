import React, { useEffect } from 'react';
import { Notification } from '../lib/api/models';
import { useGetNotifications } from '../lib/api/notifications/notifications';

/** Type representing the severity of the notification  */
export type NotificationSeverity = 'error' | 'warn' | 'success';

/** Notification reducer action types */
export type NotificationUpdate =
    | { type: 'add'; item: AppNotification }
    | { type: 'remove' }
    | { type: 'removeAll' }
    | { type: 'setUserNotifications'; notifications: Notification[] }
    | { type: 'visitNotification'; id: string };

/** Type representing an app notification  */
export type AppNotification = {
    /** The severity of the notification, whether it is an error, warning or success  */
    severity: NotificationSeverity;
    /** The notification message content */
    message: string;
};

/** Type describing the notification context state */
export type NotificationState = {
    /** Notifications that are pushed within the app due to various user actions */
    appNotifications: AppNotification[];
    /** Notifications that are received from the server because someone tagged the user, etc. */
    userNotifications: Notification[];
};

/** The default notification state */
const defaultState: NotificationState = {
    appNotifications: [],
    userNotifications: [],
};

/** The global notification context */
const NotificationStateContext = React.createContext<{
    state: NotificationState;
    dispatch: React.Dispatch<NotificationUpdate>;
}>({
    state: defaultState,
    dispatch: () => undefined,
});

/**
 * This function is a @see NotificationStateContext reducer function. Given an actions and
 * a previous state, the function transforms the action and returns a new state.
 *
 * @param state - The old notification context state
 * @param action - The action
 * @returns - New notification context state
 */
export function notificationReducer(state: NotificationState, action: NotificationUpdate): NotificationState {
    switch (action.type) {
        case 'add':
            return { ...state, appNotifications: [...state.appNotifications, action.item] };
        case 'remove':
            state.appNotifications.shift();
            return state;
        case 'setUserNotifications':
            return { ...state, userNotifications: action.notifications };
        case 'visitNotification':
            return {
                ...state,
                userNotifications: state.userNotifications.filter((notification) => notification.id !== action.id),
            };
        case 'removeAll':
            return { userNotifications: [], appNotifications: [] };
    }
}

/** Notification context wrapper */
const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(notificationReducer, defaultState);

    // We want to refetch notifications every 30 seconds
    const notificationQuery = useGetNotifications(
        { take: 20 },
        { query: { refetchInterval: 30000, refetchOnMount: true } },
    );

    useEffect(() => {
        notificationQuery.refetch();
    }, []);

    useEffect(() => {
        if (typeof notificationQuery.data !== 'undefined') {
            dispatch({ type: 'setUserNotifications', notifications: notificationQuery.data.notifications });
        }
    }, [notificationQuery.data, notificationQuery.isError]);

    return (
        <NotificationStateContext.Provider value={{ state, dispatch }}>{children}</NotificationStateContext.Provider>
    );
};

/** Notification context fetch hook */
function useNotificationState(): NotificationState {
    const context = React.useContext(NotificationStateContext);

    if (context === undefined) {
        throw new Error('useNotificationState must be used within NotificationProvider');
    }

    return context.state;
}

/** Notification context dispatch hook */
function useNotificationDispatch() {
    const context = React.useContext(NotificationStateContext);

    if (context === undefined) {
        throw new Error('useNotificationState must be used within NotificationProvider');
    }

    return context.dispatch;
}

export { NotificationProvider, useNotificationState, useNotificationDispatch };
