import { RouteProps } from 'react-router';

import HomeRoute from './../routes/Home';
import ReviewRoute from './../routes/Review';
import ProfileRoute from './../routes/Profile';
import AccountRoute from './../routes/Account';
import PublicationRoute from '../routes/Publication';
import SearchReviewRoute from '../routes/Review/Search';
import SearchPublicationRoute from '../routes/Publication/Search';
import CreatePublicationRoute from '../routes/Publication/Create';

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
    '/review/search': {
        exact: true,
        title: 'Search reviews',
        component: SearchReviewRoute,
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
    '/publication/search': {
        exact: true,
        title: 'Search publications',
        component: SearchPublicationRoute,
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
