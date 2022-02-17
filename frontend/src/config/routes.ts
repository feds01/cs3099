import PublicationRoute from '../routes/Publication';
import CreatePublicationRoute from '../routes/Publication/Create';
import AccountRoute from './../routes/Account';
import HomeRoute from './../routes/Home';
import ProfileRoute from './../routes/Profile';
import ReviewRoute from './../routes/Review';
import { RouteProps } from 'react-router';

type Extends<T, U extends T> = U;

type RoutesShape = {
    [key: string]: RouteProps;
};

type RedirectRoute = {
    from: string;
    to: string;
};

// Defined re-directs for the router to render prior to the routes. This is used
// when to define re-mappings of routes from one location to another.
export const redirects: RedirectRoute[] = [];

export type Routes = Extends<RoutesShape, typeof routes>;

export const routes = {
    '/': {
        exact: true,
        title: 'Home',
        component: HomeRoute,
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
    '/account': {
        exact: true,
        title: 'Account',
        component: AccountRoute,
    },
    '/:username/:name': {
        exact: false,
        strict: false,
        component: PublicationRoute,
    },
};
