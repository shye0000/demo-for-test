import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const List = asyncRoute(
	() => import(
		/* webpackChunkName: "contractList" */
		'./lists/List')
);

const EmergenciesList = asyncRoute(
	() => import(
		/* webpackChunkName: "emergenciesList" */
		'./lists/EmergenciesList')
);

const ContractDashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "contractDashboard" */
		'./dashboards/ContractDashboard')
);

const AdditionalClauseDashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "additionalClauseDashboard" */
		'./dashboards/AdditionalClauseDashboard')
);

const QuotationDashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "quotationDashboard" */
		'./dashboards/QuotationDashboard')
);

const AddContract = asyncRoute(
	() => import(
		/* webpackChunkName: "contractForm" */
		'./forms/AddContract')
);
export const routes = [{
	path: '/contracts/list',
	exact: true,
	component: List,
}, {
	path: '/contracts/add/:nature/:divisionId?',
	component: AddContract
}, {
	path: '/contracts/emergencies',
	exact: true,
	component: EmergenciesList,
}, {
	path: '/contracts/emergencies/:quotationId',
	exact: true,
	component: QuotationDashboard
}, {
	path: '/contracts/list/:contractId',
	exact: true,
	component: ContractDashboard
}, {
	path: '/contracts/list/additional_clauses/:additionalClauseId',
	exact: true,
	component: AdditionalClauseDashboard
}, {
	path: '/contracts/list/quotations/:quotationId',
	exact: true,
	component: QuotationDashboard
}];
