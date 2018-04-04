import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "parameterList" */
		'./List')
);

const Dashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "benefitTypeDashboard" */
		'./Dashboard')
);

const AddBenefitType = asyncRoute(
	() => import(
		/* webpackChunkName: "addBenefitTypeForm" */
		'./AddBenefitType')
);

export const routes = [{
	path: '/benefit_types',
	exact: true,
	component: List
},{
	path: '/benefit_types/add',
	component: AddBenefitType
}, {
	path: '/benefit_types/:benefitTypeId',
	component: Dashboard
}];
