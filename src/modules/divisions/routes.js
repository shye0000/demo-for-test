import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const DivisionsList = asyncRoute(
	() => import(
		/* webpackChunkName: "divisionsList" */
		'./lists/DivisionsList')
);

const SitesList = asyncRoute(
	() => import(
		/* webpackChunkName: "sitesList" */
		'./lists/SitesList')
);

const SplitView = asyncRoute(
	() => import(
		/* webpackChunkName: "divisionSplitView" */
		'./SplitView'),
	() => import(
		/* webpackChunkName: "divisionsReducers" */
		'./redux/reducers')
);

const DivisionDashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "divisionDashboard */
		'./dashboards/DivisionDashboard'),
	() => import(
		/* webpackChunkName: "divisionsReducers" */
		'./redux/reducers')
);

const SubDivisionDashboard = asyncRoute(
	() => import(
		/* webpackChunkName: "subDivisionDashboard */
		'./dashboards/SubDivisionDashboard'),
	() => import(
		/* webpackChunkName: "divisionsReducers" */
		'./redux/reducers')
);

const AddDivisions = asyncRoute(
	() => import(
		/* webpackChunkName: "divisionForm" */
		'./AddDivision')
);

export const routes = [{
	path: '/divisions',
	exact: true,
	component: DivisionsList
}, {
	path: '/sites',
	exact: true,
	component: SitesList
}, {
	path: '/divisions/add',
	component: AddDivisions
}, {
	path: '/divisions/:divisionId',
	exact: true,
	component: DivisionDashboard,
}, {
	path: '/divisions/split/:divisionId/:subDivisionId?',
	component: SplitView,
	routes: [{
		path: '/divisions/split/:divisionId',
		exact: true,
		component: DivisionDashboard
	}, {
		path: '/divisions/split/:divisionId/:subDivisionId',
		component: SubDivisionDashboard
	}]
}];
