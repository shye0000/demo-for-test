import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "parameterList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "vehicleTypeDashboard" */
		'./Dashboard')
);

const AddVehicleType = asyncRoute(
	() => import(
		/* webpackChunkName: "addVehicleTypeForm" */
		'./AddVehicleType')
);

export const routes = [{
	path: '/vehicle_types',
	exact: true,
	component: List
},{
	path: '/vehicle_types/add',
	component: AddVehicleType
}, {
	path: '/vehicle_types/:vehicleTypeId',
	component: Dashboard
}];
