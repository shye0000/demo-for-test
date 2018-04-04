import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const NotFoundPage = asyncRoute(
	() => import(
		/* webpackChunkName: "notFoundPage" */
		'./NotFoundPage')
);

export const routes = [{
	path: '/*',
	component: NotFoundPage
}, {
	path: '/not_found',
	component: NotFoundPage
}];
