import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const Scheduler = asyncRoute(
	() => import(
		/* webpackChunkName: "calendar" */
		'./Scheduler')
);

export const routes = [{
	path: '/scheduler',
	component: Scheduler
}];
