import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "employeesList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "employeeDashboard" */
		'./Dashboard')
);

const Form = asyncRoute(
	() => import(
		/* webpackChunkName: "employeeForm" */
		'./Form')
);

export const routes = [{
	path: '/employees',
	exact: true,
	component: List
},{
	path: '/employees/add',
	component: Form
}, {
	path: '/employees/:employeeId',
	component: Dashboard
}];
