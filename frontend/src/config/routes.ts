import { RouteProps } from 'react-router';

import HomeRoute from './../routes/Home';
import ProfileRoute from './../routes/Profile';
import AccountRoute from './../routes/Account';

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
    '/account': {
        exact: true,
        title: 'Account',
        component: AccountRoute,
    },
};
