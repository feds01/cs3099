import { User, UserRole } from '../lib/api/models';
import PublicationRoute from '../routes/Publication';
import CreatePublicationRoute from '../routes/Publication/Create';
import AccountRoute from './../routes/Account';
import ExploreRoute from './../routes/Explore';
import NotificationsRoute from './../routes/Notifications';
import HomeRoute from './../routes/Home';
import ProfileRoute from './../routes/Profile';
import ReviewRoute from './../routes/Review';
import ReviewsRoute from './../routes/Reviews';
import PublicationsRoute from './../routes/Publications';
import { matchPath } from 'react-router';

type RoutesShape = {
    permissionFn?: (session: User, pathname: string) => boolean;
    minimumRole?: UserRole;
    exact?: boolean;
    strict?: boolean;
    title?: string;
    component: typeof HomeRoute;
};

export type Routes = Record<string, RoutesShape>;

export const routes = {
    '/': {
        exact: true,
        title: 'Home',
        component: HomeRoute,
    },
    '/explore': {
        exact: true,
        title: 'Explore',
        component: ExploreRoute,
    },
    '/notifications': {
        exact: true,
        title: 'Notifications',
        component: NotificationsRoute,
    },
    '/profile/:id': {
        exact: false,
        title: 'Profile',
        component: ProfileRoute,
    },
    '/review/:id': {
        exact: false,
        strict: false,
        title: 'Review',
        component: ReviewRoute,
    },
    '/publication/create': {
        exact: true,
        title: 'Create publication',
        component: CreatePublicationRoute,
    },
    '/publications': {
        exact: true,
        title: 'Publications',
        component: PublicationsRoute,
    },
    '/reviews': {
        exact: true,
        title: 'Reviews',
        component: ReviewsRoute,
    },
    '/account': {
        exact: true,
        title: 'Account',
        component: AccountRoute,
    },
    '/account/:username': {
        exact: false,
        strict: false,
        permissionFn: (session: User, pathname: string) => {
            if (session.role !== 'default') return true;

            // Match the path and extract the username from the path
            const match = matchPath<{ username: string }>(pathname, {
                path: '/account/:username',
                exact: false,
                strict: false,
            });

            if (match !== null) {
                return session.username === match.params.username;
            }

            return false;
        },
        title: 'Account',
        component: AccountRoute,
    },
    '/:username/:name': {
        exact: false,
        strict: false,
        component: PublicationRoute,
    },
};
