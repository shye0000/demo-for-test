import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "parameterList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "skillDashboard" */
		'./Dashboard')
);

const AddSkill = asyncRoute(
	() => import(
		/* webpackChunkName: "addSkillForm" */
		'./AddSkill')
);

export const routes = [{
	path: '/skills',
	exact: true,
	component: List
},{
	path: '/skills/add',
	component: AddSkill
}, {
	path: '/skills/:skillId',
	component: Dashboard
}];
