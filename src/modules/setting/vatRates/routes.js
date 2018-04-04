import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "parameterList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "vatRateDashboard" */
		'./Dashboard')
);

const AddVatRate = asyncRoute(
	() => import(
		/* webpackChunkName: "addVatRateForm" */
		'./AddVatRate')
);

export const routes = [{
	path: '/vat_rates',
	exact: true,
	component: List
},{
	path: '/vat_rates/add',
	component: AddVatRate
}, {
	path: '/vat_rates/:vatRateId',
	component: Dashboard
}];
