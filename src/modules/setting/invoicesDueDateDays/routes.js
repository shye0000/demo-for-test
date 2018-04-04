import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const Dashboard = asyncRoute(
	/* webpackChunkName: "invoicesDueDateDaysDashboard" */
	() => import('./Dashboard')
);

export const routes = [{
	path: '/invoices_due_date_days/:invoicesDueDateDaysId',
	component: Dashboard
}];
