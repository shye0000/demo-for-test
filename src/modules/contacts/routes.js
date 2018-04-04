import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "contactList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "contactDashboard" */
		'./Dashboard')
);
//
// const Form = asyncRoute(
// 	() => import(
// 		/* webpackChunkName: "employeeForm" */
// 		'./Form')
// );

export const routes = [{
	path: '/contacts',
	exact: true,
	component: List
},{
// 	path: '/employees/add',
// 	component: Form
// }, {
	path: '/contacts/:contactId',
	component: Dashboard
}];
