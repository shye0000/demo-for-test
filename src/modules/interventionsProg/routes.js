import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const operationsList = asyncRoute(
	() => import(
		/* webpackChunkName: "operationsList" */
		'./List')
);

export const routes = [{
	path: '/operations',
	exact: true,
	component: operationsList
}];
