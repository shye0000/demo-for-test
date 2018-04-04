import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const interventionsList = asyncRoute(
	() => import(
		/* webpackChunkName: "interventionsList" */
		'./List')
);

export const routes = [{
	path: '/interventions',
	exact: true,
	component: interventionsList
}];
