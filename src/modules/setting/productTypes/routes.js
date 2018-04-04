import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "parameterList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "productTypeDashboard" */
		'./Dashboard')
);

const AddProductType = asyncRoute(
	() => import(
		/* webpackChunkName: "addProductTypeForm" */
		'./AddProductType')
);

export const routes = [{
	path: '/product_types',
	exact: true,
	component: List
},{
	path: '/product_types/add',
	component: AddProductType
}, {
	path: '/product_types/:productTypeId',
	component: Dashboard
}];
