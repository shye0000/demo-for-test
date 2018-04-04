import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "parameterList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "userDashboard" */
		'./Dashboard')
);

const AddUser = asyncRoute(
	() => import(
		/* webpackChunkName: "addUserForm" */
		'./AddUser')
);

export const routes = [{
	path: '/users',
	exact: true,
	component: List
},{
	path: '/users/add',
	component: AddUser
}, {
	path: '/users/:userId',
	component: Dashboard
}];
