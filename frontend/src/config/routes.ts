import { RouteProps } from 'react-router';

import HomeRoute from './../routes/Home';
import ProfileRoute from './../routes/Profile';

type Extends<T, U extends T> = U;

type RoutesShape = {
    [key: string]: RouteProps;
};

export type Routes = Extends<RoutesShape, typeof routes>;

export const routes = {
    '/': {
        exact: true,
        title: 'Home',
        selfGoverningLayout: false,
        component: HomeRoute,
    },
    '/profile/me': {
        exact: true,
        title: 'Home',
        selfGoverningLayout: true,
        component: ProfileRoute,
    },
    '/profile': {
        exact: true,
        title: 'Profile',
        selfGoverningLayout: false,
        component: ProfileRoute,
    },
};
