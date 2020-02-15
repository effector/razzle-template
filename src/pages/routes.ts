import { HomePage } from './home';
import { Error404Page } from './error404';

export const ROUTES = [
  {
    path: '/',
    exact: true,
    component: HomePage,
  },
  {
    path: '*',
    component: Error404Page,
  },
];
