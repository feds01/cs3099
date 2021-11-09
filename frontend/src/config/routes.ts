import { RouteProps } from 'react-router';

import HomeRoute from './../routes/Home';
import ProfileRoute from './../routes/Profile';
import AccountRoute from './../routes/Account';
import PublicationRoute from '../routes/Publication';
import CreatePublicationRoute from '../routes/CreatePublication';

type Extends<T, U extends T> = U;

type RoutesShape = {
    [key: string]: RouteProps;
};

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
    '/:username/:name/:revision?/tree/:path(.*)': {
        exact: false,
        component: PublicationRoute,
    },
};
