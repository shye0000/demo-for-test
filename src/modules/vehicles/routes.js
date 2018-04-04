import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "vehiclesList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "vehiclesDashboard" */
		'./Dashboard')
);

const AddVehicle = asyncRoute(
	() => import(
		/* webpackChunkName: "vehicleAddForm" */
		'./AddVehicle')
);

export const routes = [{
	path: '/vehicles',
	exact: true,
	component: List
}, {
	path: '/vehicles/add',
	component: AddVehicle
}, {
	path: '/vehicles/:vehicleId',
	component: Dashboard
}];
